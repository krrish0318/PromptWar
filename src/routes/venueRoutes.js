const express = require('express');
const { query, body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const venueController = require('../controllers/venueController');
const handleValidation = require('../middleware/validation/handleValidation');

const router = express.Router();

/**
 * Security: Targeted Rate Limiting
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

/**
 * Venue Management Endpoints
 */

// 1. Live Crowd Status
router.get('/crowd', 
  apiLimiter, 
  venueController.getCrowdStatus
);

// 2. Queue & Wait-time Predictions
router.get('/queue', 
  apiLimiter, 
  venueController.getQueuePrediction
);

// 3. AI-Powered Smart Routing
router.get('/route', 
  apiLimiter,
  [
    query('from').isString().notEmpty().withMessage('Source zone is required').escape(),
    query('to').isString().notEmpty().withMessage('Destination zone is required').escape()
  ],
  handleValidation,
  venueController.getSmartRoute
);

// 4. Natural Language Assistant (Gemini)
router.get('/assistant',
  apiLimiter,
  query('q').isString().notEmpty().withMessage('Query string is required').escape(),
  handleValidation,
  venueController.askAssistant
);

// 5. System Alert Broadcast
router.get('/alert', 
  apiLimiter, 
  venueController.triggerAlert
);

// 6. Admin: Density Simulation Control
router.post('/admin/density',
  apiLimiter,
  [
    body('zoneId').isString().notEmpty().withMessage('Zone ID is missing').escape(),
    body('density').isNumeric().isInt({ min: 0, max: 100 }).withMessage('Density must be 0-100')
  ],
  handleValidation,
  venueController.updateDensity
);

module.exports = router;
