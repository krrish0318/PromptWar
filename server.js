const express = require('express');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Simplified for demo
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', require('./src/routes/api'));

// Minimal Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "System error" });
});

app.listen(PORT, () => console.log(`🚀 Venue Engine @ http://localhost:${PORT}`));

module.exports = app;
