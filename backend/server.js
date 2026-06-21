import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './app/config/db.js';
import authRouter, { initTestUsers } from './app/routes/auth.js';
import levelsRouter from './app/routes/levels.js';
import profileRouter from './app/routes/profile.js';
import subscriptionRouter from './app/routes/subscriptions.js';
import productsRouter from './app/routes/products.js';
import ordersRouter from './app/routes/orders.js';
import aiRouter from './app/routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Setup Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Register Routes
app.use('/api/auth', authRouter);
app.use('/api/levels', levelsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/ai', aiRouter);

app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'EXIMARG Node.js API Gateway' });
});

// Database & Server Startup
const startServer = async () => {
  await connectDB();
  await initTestUsers();
  
  app.listen(PORT, () => {
    console.log(`EXIMARG Node.js API server running on port ${PORT}`);
  });
};

startServer();
