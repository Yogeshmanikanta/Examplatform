import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import examRoutes from './routes/exam.routes.js';
import questionRoutes from './routes/question.routes.js';
import engineRoutes from './routes/engine.routes.js';
import resultRoutes from './routes/result.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import adminRoutes from './routes/admin.routes.js';
import codingRoutes from './routes/coding.routes.js';

dotenv.config();

const app = express();

// Parse JSON body - MUST be before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

// CORS

app.set('trust proxy', 1); // Add this line

app.use(
  cors({
    //origin: 'http://localhost:5173',
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use('/api/', limiter);
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Exam Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
// Routes - ORDER MATTERS
app.use('/api/auth', authRoutes);
app.use('/api/exams/:exam_id/questions', questionRoutes);
app.use('/api/exams/:exam_id/results', resultRoutes);
app.use('/api/exams/:exam_id', engineRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exams/:exam_id/questions', codingRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

export default app;
