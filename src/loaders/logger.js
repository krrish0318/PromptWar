/**
 * Standardized Logging Loader
 * Wraps console or a library like Winston to provide consistent log formatting.
 */

const { SYSTEM } = require('../utils/constants');

class Logger {
  static info(message, meta = {}) {
    this._log('INFO', message, meta);
  }

  static warn(message, meta = {}) {
    this._log('WARN', message, meta);
  }

  static error(message, meta = {}) {
    this._log('ERROR', message, meta);
  }

  static _log(level, message, meta) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level,
      message,
      timestamp,
      service: SYSTEM.SERVICE_NAME,
      ...meta
    };
    
    // In production, this can be piped to Winston/Cloud Logging
    const color = level === 'ERROR' ? '\x1b[31m' : (level === 'WARN' ? '\x1b[33m' : '\x1b[32m');
    const reset = '\x1b[0m';
    
    console.log(`${color}[${level}]${reset} ${timestamp}: ${message}`, 
      Object.keys(meta).length ? JSON.stringify(meta) : '');
  }
}

module.exports = Logger;
