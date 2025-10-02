const express = require('express');
const axios = require('axios');
const db = require('../models/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Configurações do Instagram Basic Display API
// NOTA: Para produção, essas configurações devem vir de variáveis de ambiente
const INSTAGRAM_CONFIG = {
  CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID || 'your_instagram_client_id',
  CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET || 'your_instagram_client_secret',
  REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3001/api/instagram/callback',
  ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN || null
};

// Buscar posts do Instagram salvos no cache (público)
router.get('/posts', (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  db.all(
    'SELECT * FROM instagram_posts ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [parseInt(limit), offset],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar posts do Instagram' });
      }

      // Buscar contagem total
      db.get(
        'SELECT COUNT(*) as total FROM instagram_posts',
        (err, count) => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao contar posts' });
          }

          res.json({
            posts,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: count.total,
              pages: Math.ceil(count.total / limit)
            }
          });
        }
      );
    }
  );
});

// Sincronizar posts do Instagram (admin)
router.post('/sync', authenticateAdmin, async (req, res) => {
  if (!INSTAGRAM_CONFIG.ACCESS_TOKEN) {
    return res.status(400).json({ 
      error: 'Token de acesso do Instagram não configurado',
      message: 'Configure INSTAGRAM_ACCESS_TOKEN nas variáveis de ambiente'
    });
  }

  try {
    // Buscar posts do Instagram via API
    const response = await axios.get(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${INSTAGRAM_CONFIG.ACCESS_TOKEN}`
    );

    const instagramPosts = response.data.data;
    let syncedCount = 0;
    let errorCount = 0;

    // Processar cada post
    for (const post of instagramPosts) {
      try {
        // Verificar se o post já existe
        const existingPost = await new Promise((resolve, reject) => {
          db.get(
            'SELECT id FROM instagram_posts WHERE instagram_id = ?',
            [post.id],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });

        if (existingPost) {
          // Atualizar post existente
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE instagram_posts 
               SET caption = ?, media_url = ?, media_type = ?, permalink = ?, timestamp = ?, updated_at = CURRENT_TIMESTAMP
               WHERE instagram_id = ?`,
              [post.caption || '', post.media_url, post.media_type, post.permalink, post.timestamp, post.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        } else {
          // Criar novo post
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO instagram_posts (instagram_id, caption, media_url, media_type, permalink, timestamp) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [post.id, post.caption || '', post.media_url, post.media_type, post.permalink, post.timestamp],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }

        syncedCount++;
      } catch (error) {
        console.error(`Erro ao processar post ${post.id}:`, error);
        errorCount++;
      }
    }

    res.json({
      message: 'Sincronização concluída',
      syncedCount,
      errorCount,
      totalPosts: instagramPosts.length
    });

  } catch (error) {
    console.error('Erro na sincronização do Instagram:', error);
    
    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: 'Token de acesso inválido ou expirado',
        message: 'Verifique o token de acesso do Instagram'
      });
    }

    res.status(500).json({ 
      error: 'Erro ao sincronizar com Instagram',
      message: error.message 
    });
  }
});

// Configurar webhook do Instagram (admin)
router.post('/webhook/setup', authenticateAdmin, async (req, res) => {
  // Esta rota seria usada para configurar webhooks do Instagram
  // Por simplicidade, vamos apenas retornar instruções
  res.json({
    message: 'Configuração de webhook',
    instructions: [
      '1. Configure o webhook no Facebook Developer Console',
      '2. Use a URL: /api/instagram/webhook',
      '3. Configure os eventos desejados',
      '4. Verifique o token de verificação'
    ],
    webhookUrl: `${req.protocol}://${req.get('host')}/api/instagram/webhook`
  });
});

// Webhook do Instagram (público - para receber atualizações)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Token de verificação (deve ser configurado)
  const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'instagram_webhook_verify_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Receber atualizações do webhook (público)
router.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'instagram') {
    // Processar atualizações do Instagram
    body.entry.forEach(entry => {
      entry.changes.forEach(change => {
        console.log('Mudança recebida:', change);
        // Aqui você pode implementar lógica para processar as mudanças
        // Por exemplo, sincronizar automaticamente quando há novos posts
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Obter estatísticas dos posts do Instagram (admin)
router.get('/stats', authenticateAdmin, (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM instagram_posts',
    'SELECT COUNT(*) as images FROM instagram_posts WHERE media_type = "IMAGE"',
    'SELECT COUNT(*) as videos FROM instagram_posts WHERE media_type = "VIDEO"',
    'SELECT COUNT(*) as carousels FROM instagram_posts WHERE media_type = "CAROUSEL_ALBUM"'
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.get(query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    })
  )).then(results => {
    res.json({
      total: results[0].total,
      images: results[1].images,
      videos: results[2].videos,
      carousels: results[3].carousels,
      lastSync: new Date().toISOString()
    });
  }).catch(error => {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  });
});

// Deletar post do Instagram do cache (admin)
router.delete('/posts/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM instagram_posts WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar post' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    res.json({ message: 'Post deletado com sucesso' });
  });
});

// Instruções de configuração (admin)
router.get('/setup', authenticateAdmin, (req, res) => {
  res.json({
    message: 'Configuração da integração com Instagram',
    steps: [
      '1. Crie um app no Facebook Developer Console',
      '2. Configure o Instagram Basic Display API',
      '3. Obtenha o Client ID e Client Secret',
      '4. Configure as variáveis de ambiente:',
      '   - INSTAGRAM_CLIENT_ID',
      '   - INSTAGRAM_CLIENT_SECRET', 
      '   - INSTAGRAM_ACCESS_TOKEN',
      '   - INSTAGRAM_REDIRECT_URI',
      '5. Use /api/instagram/sync para sincronizar posts'
    ],
    currentConfig: {
      clientId: INSTAGRAM_CONFIG.CLIENT_ID !== 'your_instagram_client_id' ? 'Configurado' : 'Não configurado',
      clientSecret: INSTAGRAM_CONFIG.CLIENT_SECRET !== 'your_instagram_client_secret' ? 'Configurado' : 'Não configurado',
      accessToken: INSTAGRAM_CONFIG.ACCESS_TOKEN ? 'Configurado' : 'Não configurado'
    }
  });
});

module.exports = router;
