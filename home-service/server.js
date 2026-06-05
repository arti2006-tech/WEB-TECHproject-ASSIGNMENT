const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3002;
const JWT_SECRET = 'webtech-assignment-secret-key-2024';

app.use(cors());
app.use(express.json());

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/home', authenticate, (req, res) => {
  res.json({
    message: `Welcome to the home page, ${req.user.username}!`,
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/profile', authenticate, (req, res) => {
  res.json({
    username: req.user.username,
    email: req.user.email,
    id: req.user.id
  });
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Home service running on port ${PORT}`);
});
