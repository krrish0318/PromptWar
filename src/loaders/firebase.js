const admin = require('firebase-admin');
const fs = require('fs');
const Logger = require('./logger');

/**
 * Firebase Loader
 * Handles secure initialization of Firebase Admin SDK.
 */
module.exports = async () => {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        databaseURL: JSON.parse(process.env.FIREBASE_CONFIG || '{}').databaseURL
      });
      Logger.info('Firebase Admin SDK initialized successfully');
    } else {
      Logger.warn('Firebase Service Account not found. Firebase features will be disabled or simulated.');
    }
  } catch (error) {
    Logger.error('Failed to initialize Firebase', { error: error.message });
  }
};
