// src/index.js
// Rotas básicas da API + páginas estáticas + healthcheck.

const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(express.json());

// pasta public (ficheiros estáticos: html, css, js, etc.)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// endpoint principal (usado também nos testes)
app.get('/', (req, res) => {
  res.json({
    msg: 'Hello from Sprint 13',
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// lista simples de utilizadores (para exemplo/testes)
const users = [
  { id: 1, name: 'João' },
  { id: 2, name: 'Rafaela' },
  { id: 3, name: 'Miguel' }
];

app.get('/users', (req, res) => {
  res.json(users);
});

// página about
app.get('/about', (req, res) => {
  res.sendFile(path.join(publicPath, 'about.html'));
});

// alternativa para aceder diretamente a /about.html
app.get('/about.html', (req, res) => {
  res.redirect('/about');
});

// /monitor → redireciona para o ficheiro monitor.html 
app.get('/monitor', (req, res) => {
  res.redirect('/monitor.html');
});

// healthcheck (pode ser usado por um dashboard ou monitorização externa)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
//nota teste2