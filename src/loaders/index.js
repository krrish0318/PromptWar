const expressLoader = require('./express');
const firebaseLoader = require('./firebase');
const Logger = require('./logger');

/**
 * Main Loader Orchestrator
 * Performs sequential initialization of all system components.
 */
module.exports = async (expressApp) => {
  Logger.info('Initializing system components...');

  await firebaseLoader();
  Logger.info('Firebase loaded');

  await expressLoader(expressApp);
  Logger.info('Express loaded');
  
  Logger.info('✅ All loaders completed successfully');
};
