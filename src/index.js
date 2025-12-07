// src/index.js
// Aplicação Express com rotas básicas, healthcheck e suporte para dashboard.

const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());

const publicPath = path.join(__dirname, '..', 'public');

// ficheiros estáticos
app.use(express.static(publicPath));

// / -> health + info básica
app.get('/', (req, res) => {
  res.json({
    msg: 'API operacional',
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// /users
app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'João' },
    { id: 2, name: 'Rafaela' },
    { id: 3, name: 'Miguel' }
  ]);
});

// /about
app.get('/about', (req, res) => {
  res.sendFile(path.join(publicPath, 'about.html'));
});

// /about.html
app.get('/about.html', (req, res) => {
  res.sendFile(path.join(publicPath, 'about.html'));
});

// /monitor -> redireciona para o HTML
app.get('/monitor', (req, res) => {
  res.redirect('/monitor.html');
});

module.exports = app;
