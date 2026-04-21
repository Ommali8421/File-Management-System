const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./database');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_super_secret_jwt_key';

app.use(cors());
app.use(express.json());

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Initialize DB and Routes
getDb().then(db => {

  // Auth: Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      
      const token = jwt.sign({ id: result.lastID, username }, SECRET_KEY);
      res.status(201).json({ token, user: { id: result.lastID, username } });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Username already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // Auth: Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
      
      if (!user) return res.status(400).json({ error: 'User not found' });
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
      
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Files: Upload
  app.post('/api/files/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      
      const { filename, originalname, mimetype, size } = req.file;
      const userId = req.user.id;
      
      const result = await db.run(
        'INSERT INTO files (user_id, filename, originalname, mimetype, size) VALUES (?, ?, ?, ?, ?)',
        [userId, filename, originalname, mimetype, size]
      );
      
      const newFile = await db.get('SELECT * FROM files WHERE id = ?', [result.lastID]);
      res.status(201).json(newFile);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Files: List
  app.get('/api/files', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const files = await db.all('SELECT * FROM files WHERE user_id = ? ORDER BY upload_date DESC', [userId]);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Files: Download
  app.get('/api/files/download/:id', authenticateToken, async (req, res) => {
    try {
      const fileId = req.params.id;
      const userId = req.user.id;
      
      const file = await db.get('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId]);
      
      if (!file) return res.status(404).json({ error: 'File not found' });
      
      const filePath = path.join(__dirname, 'uploads', file.filename);
      res.download(filePath, file.originalname);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Files: Delete
  app.delete('/api/files/:id', authenticateToken, async (req, res) => {
    try {
      const fileId = req.params.id;
      const userId = req.user.id;
      
      const file = await db.get('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId]);
      
      if (!file) return res.status(404).json({ error: 'File not found' });
      
      const filePath = path.join(__dirname, 'uploads', file.filename);
      
      // Delete file from filesystem
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete from DB
      await db.run('DELETE FROM files WHERE id = ? AND user_id = ?', [fileId, userId]);
      
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(console.error);
