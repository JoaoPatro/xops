// Carrega variáveis de ambiente do .env
require('dotenv').config();

// Importa a app principal
const app = require('./index');

// Define a porta
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});