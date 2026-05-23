const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ─── SECURITY ─────────────────────────────
app.use(helmet());

// ─── CORS (React + future deploy) ─────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true,
}));

// ─── RATE LIMIT ─────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ─── BODY PARSING ─────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── DEV LOGGER ─────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── STATIC FILES ─────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── HEALTH CHECK ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is working 🚀',
    timestamp: new Date()
  });
});

// ─── TEMP LOGIN (for frontend testing) ─────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@test.com' && password === '1234') {
    return res.json({
      user: {
        id: 1,
        name: 'Admin User',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({
    message: 'Invalid credentials'
  });
});

// ─── 404 HANDLER ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ─── ERROR HANDLER ─────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── START SERVER ─────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
});