// src/index.js
// Ficheiro principal da aplicação Express. Define rotas e exporta o app.

const express = require('express');
const path = require('path');

const app = express();

// Middleware básico
app.use(express.json());

// Caminho para a pasta pública (onde está o about.html)
const publicPath = path.join(__dirname, '..', 'public');

// Servir ficheiros estáticos da pasta public
app.use(express.static(publicPath));

// Rota principal usada nos testes automatizados
app.get('/', (req, res) => {
  res.json({ msg: 'Hello from Sprint 13' });
});

// Lista simples de utilizadores (devolvida em /users)
app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'João' },
    { id: 2, name: 'Rafaela' },
    { id: 3, name: 'Miguel' }
  ]);
});

// Rota para devolver a página about.html
app.get('/about', (req, res) => {
  res.sendFile(path.join(publicPath, 'about.html'));
});

// Rota alternativa para aceder diretamente a /about.html
app.get('/about.html', (req, res) => {
  res.sendFile(path.join(publicPath, 'about.html'));
});

module.exports = app;
