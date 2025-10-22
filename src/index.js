const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ msg: 'Hello from Sprint 13' });
});

module.exports = app;
