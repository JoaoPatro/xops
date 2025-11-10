// XOPS-23: Exemplo de integração de IA no pipeline

const fs = require('fs');
const path = require('path');

// Normalmente viriam de secrets do GitHub
const apiKey = process.env.OPENAI_API_KEY;

// Pequeno contexto: vamos enviar um resumo de ficheiros para a IA
function getFilesSummary() {
  const srcDir = path.join(__dirname, 'src');
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));

  const summary = files.map(file => {
    const content = fs.readFileSync(path.join(srcDir, file), 'utf8');
    return `// File: ${file}\n${content.substring(0, 400)}\n`;
  }).join('\n');

  return summary;
}

async function run() {
  if (!apiKey) {
    console.log('🤖 [AI Review] OPENAI_API_KEY não definido. A integrar IA via pipeline, mas a correr em modo demo.');
    process.exit(0);
  }

  const prompt = `
Faz uma revisão rápida de qualidade e boas práticas para o seguinte código Node.js Express.
Responde em 5 pontos objetivos:
${getFilesSummary()}
  `;

  // NOTA: Exemplo de chamada. No ambiente real seria preciso fetch/axios.
  // Aqui só mostramos a integração estrutural.
  console.log('🤖 [AI Review] IA integrada. Exemplo: aqui faríamos uma chamada à API com o código.');
  console.log('Prompt gerado para IA:\n', prompt.substring(0, 600), '...\n');
}

run().catch(err => {
  console.error('Erro na AI Review:', err);
  process.exit(1);
});
