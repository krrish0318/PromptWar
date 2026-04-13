const express = require('express');
require('dotenv').config();

const validateConfig = require('./src/utils/config');
const loaders = require('./src/loaders');
const Logger = require('./src/loaders/logger');
const { SYSTEM } = require('./src/utils/constants');

/**
 * VenueCrowd Bootstrap
 * High-quality entry point utilizing the Loaders pattern for extreme modularity.
 */
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // 1. Initial Validation
  validateConfig();

  // 2. Initialize Loaders (Firebase, Express, Routes, etc.)
  await loaders(app);

  // 3. Start Listening
  app.listen(PORT, (err) => {
    if (err) {
      Logger.error('Failed to start server', { error: err.message });
      process.exit(1);
    }
    
    Logger.info(`
      ################################################
      🚀 ${SYSTEM.SERVICE_NAME} v${SYSTEM.VERSION}
      🛡️  Environment: ${process.env.NODE_ENV || 'development'}
      📡 Listening on: http://localhost:${PORT}
      ################################################
    `);
  });
}

// Global Exception Tracking
process.on('uncaughtException', (err) => {
  Logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  Logger.error('Unhandled Rejection', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Launch
startServer();
