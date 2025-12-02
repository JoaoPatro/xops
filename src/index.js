const express = require('express');
const path = require('path');

console.log('>>> ESTE É O index.js QUE O NODE ESTÁ A USAR!', __filename);


const app = express(); 

// 1) Caminho para a pasta public (que está fora de src)
const publicPath = path.join(__dirname, '..', 'public');
console.log('📁 publicPath =', publicPath);

// 2) Servir ficheiros estáticos (about.html, css, imagens, etc.)
app.use(express.static(publicPath));

// 3) Rota principal da API (usada nos testes)
app.get('/', (req, res) => {
  res.json({ msg: 'Hello from Sprint 13' });
});

app.get('/users', (req, res) => {
  console.log('>>> ENTROU NA ROTA /users DO index.js');

  res.json([
    { id: 1, name: 'Joãooo' },
    { id: 2, name: 'Micaela' },
    { id: 3, name: 'Miguel' }
  ]);
});



// 5) Rota /about (sem .html)
app.get('/about', (req, res) => {
  console.log('➡️ GET /about');
  res.sendFile(path.join(publicPath, 'about.html'));
});

// 6) Rota /about.html
app.get('/about.html', (req, res) => {
  console.log('➡️ GET /about.html');
  res.sendFile(path.join(publicPath, 'about.html'));
});

module.exports = app;