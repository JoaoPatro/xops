// src/server.js
require('dotenv').config();
const app = require('./index');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});
