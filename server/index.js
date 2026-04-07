require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const recipeRoutes   = require('./routes/recipes');
const cartRoutes     = require('./routes/cart');
const orderRoutes    = require('./routes/orders');
const chatRoutes     = require('./routes/chat');
const mealPlanRoutes = require('./routes/mealPlans');
const adminRoutes    = require('./routes/admin');
const uploadRoutes   = require('./routes/upload');
const deliveryRoutes = require('./routes/delivery');

const app = express();

// ── CORS ──
const allowedOrigins = [
  'http://localhost:3000',
  'https://groceryai-rho.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// ── Routes ──
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/recipes',    recipeRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/chat',       chatRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/delivery',   deliveryRoutes);

// ── Health check — Render pings this to keep server alive ──
app.get('/',          (req, res) => res.json({ message: 'GroceryAI Backend is running 🚀' }));
app.get('/api/health',(req, res) => res.json({ status: 'OK', time: new Date(), env: process.env.NODE_ENV }));

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Connect DB then start server ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
