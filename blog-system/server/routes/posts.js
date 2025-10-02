const express = require('express');
const db = require('../models/database');
const { authenticateAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Listar todos os posts (público)
router.get('/', (req, res) => {
  const { status = 'published', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.*, u.username as author_name 
    FROM posts p 
    LEFT JOIN users u ON p.author_id = u.id 
    WHERE p.status = ?
    ORDER BY p.created_at DESC 
    LIMIT ? OFFSET ?
  `;

  db.all(query, [status, parseInt(limit), offset], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar posts' });
    }

    // Buscar contagem total
    db.get(
      'SELECT COUNT(*) as total FROM posts WHERE status = ?',
      [status],
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
  });
});

// Buscar post por ID (público)
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT p.*, u.username as author_name 
    FROM posts p 
    LEFT JOIN users u ON p.author_id = u.id 
    WHERE p.id = ?
  `;

  db.get(query, [id], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar post' });
    }

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Buscar mídia associada
    db.all(
      'SELECT * FROM media WHERE post_id = ?',
      [id],
      (err, media) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar mídia' });
        }

        res.json({
          ...post,
          media
        });
      }
    );
  });
});

// Criar novo post (admin)
router.post('/', authenticateAdmin, (req, res) => {
  const { title, content, excerpt, status = 'draft' } = req.body;
  const author_id = req.user.id;

  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  db.run(
    `INSERT INTO posts (title, content, excerpt, status, author_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [title, content, excerpt, status, author_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar post' });
      }

      res.status(201).json({
        message: 'Post criado com sucesso',
        postId: this.lastID
      });
    }
  );
});

// Atualizar post (admin)
router.put('/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, status, featured_image } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }

  db.run(
    `UPDATE posts 
     SET title = ?, content = ?, excerpt = ?, status = ?, featured_image = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, content, excerpt, status, featured_image, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar post' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      res.json({ message: 'Post atualizado com sucesso' });
    }
  );
});

// Deletar post (admin)
router.delete('/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar post' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    res.json({ message: 'Post deletado com sucesso' });
  });
});

// Upload de mídia (admin)
router.post('/upload', authenticateAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const { post_id } = req.body;

  db.run(
    `INSERT INTO media (filename, original_name, mime_type, size, path, post_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.file.path,
      post_id || null
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao salvar mídia' });
      }

      res.json({
        message: 'Arquivo enviado com sucesso',
        file: {
          id: this.lastID,
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url: `/uploads/${req.file.filename}`
        }
      });
    }
  );
});

// Listar mídia (admin)
router.get('/media/list', authenticateAdmin, (req, res) => {
  db.all('SELECT * FROM media ORDER BY created_at DESC', (err, media) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar mídia' });
    }

    const mediaWithUrls = media.map(item => ({
      ...item,
      url: `/uploads/${item.filename}`
    }));

    res.json(mediaWithUrls);
  });
});

module.exports = router;
