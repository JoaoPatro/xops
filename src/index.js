// src/index.js
// Rotas básicas da API + páginas estáticas + healthcheck.

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Caminho para a pasta public
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Rota principal (usada nos testes)
app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from Sprint 13',
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Lista simples de utilizadores
app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'João' },
    { id: 2, name: 'Rafaela' },
    { id: 3, name: 'Miguel' }
  ]);
});

// Página about
app.get('/about', (req, res) => {
  res.sendFile(path.join(publicPath, 'about.html'));
});

// Alternativa para /about.html
app.get('/about.html', (req, res) => {
  res.sendFile(path.join(publicPath, 'about.html'));
});

// Monitor → redireciona para o dashboard
app.get('/monitor', (req, res) => {
  res.redirect('/monitor.html');
});

// Healthcheck (usado pelo dashboard)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
