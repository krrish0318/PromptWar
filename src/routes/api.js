const express = require('express');
const { query, body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const service = require('../services/venueService');
const { zones } = require('../data/venueData');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// API Endpoints
router.get('/crowd', limiter, (req, res) => res.json(zones));

router.get('/queue', limiter, (req, res) => res.json(service.getQueues()));

router.get('/route', limiter, [query('from').notEmpty(), query('to').notEmpty()], (req, res) => {
  const result = service.findPath(req.query.from, req.query.to);
  result ? res.json(result) : res.status(404).json({ error: "No path" });
});

router.get('/assistant', limiter, query('q').notEmpty(), async (req, res) => {
  res.json(await service.analyze(req.query.q));
});

router.post('/admin/density', limiter, [body('zoneId').notEmpty(), body('density').isInt({ min: 0, max: 100 })], (req, res) => {
  const zone = zones.find(z => z.id === req.body.zoneId);
  if (!zone) return res.status(404).json({ error: "Not found" });
  zone.density = req.body.density;
  res.json({ success: true, zone });
});

module.exports = router;
