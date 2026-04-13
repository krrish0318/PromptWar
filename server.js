const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * PRODUCTION SECURITY CONFIGURATION
 */

// 1. Advanced Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Security Alert: Rate limit exceeded. Please try again later.' }
});

// 2. Strict Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
      "img-src": ["'self'", "data:", "https://maps.gstatic.com", "https://maps.googleapis.com", "https://lh3.googleusercontent.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "connect-src": ["'self'", "https://maps.googleapis.com"],
      "frame-ancestors": ["'none'"] // Prevent clickjacking
    }
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// 3. CORS & Parser Configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Protect against large payload DOS
app.use(express.static('public'));

/**
 * MODULAR API ROUTES
 */
const venueRoutes = require('./src/routes/venueRoutes');
const calendarSync = require('./src/services/calendarSync'); // Extracted for maintainability

app.use('/api/venue', limiter, venueRoutes);
app.post('/api/calendar/sync', limiter, calendarSync.handleSync);

/**
 * GLOBAL ERROR ORCHESTRATOR
 */
app.use((err, req, res, next) => {
    const googleService = require('./src/services/googleService');
    const statusCode = err.status || 500;
    
    // Log to Google Cloud (Simulated)
    googleService.logEvent('CRITICAL', `API Failure: ${err.message}`, {
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    res.status(statusCode).json({
      error: 'Engine Exception',
      message: process.env.NODE_ENV === 'production' ? 'Internal system error' : err.message,
      requestId: Date.now()
    });
});

/**
 * INITIALIZATION
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\x1b[36m%s\x1b[0m`, `-----------------------------------------`);
    console.log(`\x1b[32m%s\x1b[0m`, `VENUE OPTIMIZATION ENGINE LIVE AT PORT ${PORT}`);
    console.log(`\x1b[36m%s\x1b[0m`, `-----------------------------------------`);
  });
}

module.exports = app;
