const express = require('express');
const db = require('../models/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar comentários de um post (público - apenas aprovados)
router.get('/post/:postId', (req, res) => {
  const { postId } = req.params;
  const { status = 'approved' } = req.query;

  db.all(
    'SELECT * FROM comments WHERE post_id = ? AND status = ? ORDER BY created_at ASC',
    [postId, status],
    (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar comentários' });
      }

      res.json(comments);
    }
  );
});

// Criar novo comentário (público)
router.post('/', (req, res) => {
  const { post_id, author_name, author_email, content } = req.body;

  if (!post_id || !author_name || !author_email || !content) {
    return res.status(400).json({ 
      error: 'Post ID, nome, email e conteúdo são obrigatórios' 
    });
  }

  // Validar email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(author_email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  // Verificar se o post existe
  db.get('SELECT id FROM posts WHERE id = ?', [post_id], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Criar comentário com status pendente
    db.run(
      `INSERT INTO comments (post_id, author_name, author_email, content, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [post_id, author_name, author_email, content],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao criar comentário' });
        }

        res.status(201).json({
          message: 'Comentário enviado com sucesso. Aguardando moderação.',
          commentId: this.lastID
        });
      }
    );
  });
});

// Listar todos os comentários (admin)
router.get('/admin/all', authenticateAdmin, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT c.*, p.title as post_title 
    FROM comments c 
    LEFT JOIN posts p ON c.post_id = p.id
  `;
  let params = [];

  if (status) {
    query += ' WHERE c.status = ?';
    params.push(status);
  }

  query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, comments) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar comentários' });
    }

    // Buscar contagem total
    let countQuery = 'SELECT COUNT(*) as total FROM comments';
    let countParams = [];

    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    db.get(countQuery, countParams, (err, count) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao contar comentários' });
      }

      res.json({
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count.total,
          pages: Math.ceil(count.total / limit)
        }
      });
    });
  });
});

// Aprovar comentário (admin)
router.put('/:id/approve', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE comments SET status = ? WHERE id = ?',
    ['approved', id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao aprovar comentário' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      res.json({ message: 'Comentário aprovado com sucesso' });
    }
  );
});

// Rejeitar comentário (admin)
router.put('/:id/reject', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE comments SET status = ? WHERE id = ?',
    ['rejected', id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao rejeitar comentário' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Comentário não encontrado' });
      }

      res.json({ message: 'Comentário rejeitado com sucesso' });
    }
  );
});

// Deletar comentário (admin)
router.delete('/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar comentário' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    res.json({ message: 'Comentário deletado com sucesso' });
  });
});

// Buscar comentário por ID (admin)
router.get('/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT c.*, p.title as post_title 
    FROM comments c 
    LEFT JOIN posts p ON c.post_id = p.id 
    WHERE c.id = ?
  `;

  db.get(query, [id], (err, comment) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar comentário' });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    res.json(comment);
  });
});

module.exports = router;
