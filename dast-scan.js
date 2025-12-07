// dast-scan.js
// Testes de segurança dinâmicos (DAST) sobre a API em execução

const request = require('supertest');
const app = require('./src'); // importa a app Express do src/index.js

// verifica se as rotas não devolvem 500 com input "estranho"
async function testNo500OnWeirdInput() {
  const routes = ['/', '/users'];
  const payloads = [
    "' OR '1'='1",
    '<script>alert(1)</script>',
    '../../etc/passwd',
    JSON.stringify({ $where: 'this.password.length > 0' })
  ];

  const errors = [];

  for (const route of routes) {
    for (const payload of payloads) {
      const res = await request(app)
        .get(route)
        .query({ q: payload });

      // qualquer status >= 500 é considerado problema
      if (res.status >= 500) {
        errors.push(
          `[500] Rota ${route} rebentou com payload "${payload}".`
        );
      }
    }
  }

  return errors;
}

// verifica se há possível XSS refletido em /users
async function testNoReflectedXss() {
  const xssPayload = '<script>alert("xss")</script>';
  const res = await request(app)
    .get('/users')
    .query({ q: xssPayload });

  const body =
    typeof res.text === 'string' ? res.text : JSON.stringify(res.body);

  const errors = [];

  // se o payload aparecer tal e qual na resposta, pode indicar XSS refletido
  if (body.includes(xssPayload)) {
    errors.push(
      'Possível XSS refletido em /users (payload devolvido tal e qual).'
    );
  }

  return errors;
}

// corre todos os testes DAST e decide se a pipeline passa ou falha
async function runDast() {
  console.log('A correr testes DAST (dynamic security tests)...');

  let errors = [];

  errors = errors.concat(await testNo500OnWeirdInput());
  errors = errors.concat(await testNoReflectedXss());

  if (errors.length > 0) {
    console.error('\n[DAST] Foram encontradas vulnerabilidades:');
    for (const err of errors) {
      console.error(' - ' + err);
    }
    console.error('\n[DAST] Falhou. A pipeline deve chumbar.');
    process.exit(1); // exit code 1 para falhar o job do CI
  } else {
    console.log('[DAST] Nenhuma vulnerabilidade encontrada nos testes definidos.');
    process.exit(0); // sucesso
  }
}

// ponto de entrada do script
runDast().catch((err) => {
  console.error('[DAST] Erro inesperado durante o scan:', err);
  process.exit(1);
});
