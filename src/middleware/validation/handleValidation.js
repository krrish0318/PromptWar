const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../../utils/constants');

/**
 * Common Validation Result Handler
 * Intercepts express-validator errors and returns a standardized response.
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};
