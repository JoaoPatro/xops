const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ msg: 'Hello from Sprint 13' });
});

app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'João Patrocínio' },
    { id: 2, name: 'Micaela' },
    { id: 3, name: 'Miguel' }
  ]);
});

module.exports = app;
