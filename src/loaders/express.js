const express = require('express');
const path = require('path');
const configureSecurity = require('../middleware/security');
const venueRoutes = require('../routes/venueRoutes');
const calendarRoutes = require('../routes/calendarRoutes');
const { SYSTEM, HTTP_STATUS } = require('../utils/constants');
const Logger = require('./logger');

/**
 * Express Loader
 * Configures the Express application with middleware, routes, and error handlers.
 */
module.exports = async (app) => {
  // 1. Health Check (before security/logging for orchestration)
  app.get('/health', (req, res) => {
    res.status(HTTP_STATUS.OK).json({ 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      version: SYSTEM.VERSION
    });
  });

  // 2. Security Middleware
  configureSecurity(app);

  // 3. Body Parsers
  app.use(express.json({ limit: '10kb' })); 
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // 4. Static Assets
  app.use(express.static(path.join(process.cwd(), 'public')));

  // 5. API Routes
  app.use('/api/venue', venueRoutes);
  app.use('/api/calendar', calendarRoutes);

  // 6. 404 Handler
  app.use((req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: 'Not Found',
      message: `The requested path ${req.path} does not exist.`
    });
  });

  // 7. Global Error Handler
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    
    Logger.error(err.message || 'Server Exception', { 
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
      path: req.path,
      method: req.method,
      operational: err.isOperational
    });

    res.status(statusCode).json({ 
      error: 'VenueCrowd Engine Exception',
      message: process.env.NODE_ENV === 'production' && !err.isOperational 
          ? 'An internal error occurred.' 
          : err.message,
      trackingId: `ERR-${Date.now()}`
    });
  });

  Logger.info('Express configuration completed');
};
