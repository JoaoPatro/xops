// Carrega variáveis de ambiente do ficheiro .env
require('dotenv').config();

// Importa a app principal (definida em src/index.js)
const app = require('./index');

// Define a porta — usa a do .env se existir, senão usa 3000 por padrão
const PORT = process.env.PORT || 3000;

// Inicia o servidor e mostra mensagem no terminal
app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});
