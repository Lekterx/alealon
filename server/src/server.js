require('dotenv/config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const env = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const categoryRoutes = require('./routes/categories');
const communeRoutes = require('./routes/communes');
const submissionRoutes = require('./routes/submissions');
const adRoutes = require('./routes/ads');
const scrapingRoutes = require('./routes/scraping');

const app = express();

// Trust proxy (derrière Nginx)
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware globaux
app.use(helmet());
app.use(cors({
  origin: env.APP_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/communes', communeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/scraping', scrapingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Alé Alon API running on port ${env.PORT} (${env.NODE_ENV})`);
});
