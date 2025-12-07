
// Script que faz uma chamada REAL à API da OpenAI para rever o código

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// 1) Ler chave da variável de ambiente
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error(' OPENAI_API_KEY não definida. Verifica o .env (local) ou os Secrets do GitHub.');
  process.exit(1);
}

// 2) Criar cliente OpenAI
const client = new OpenAI({ apiKey });

/**
 * Lê o ficheiro de código que queremos rever.
 * usamos o src/index.js e src/server.js como exemplo.
 */
function readCodeFiles() {
  const files = ['src/index.js', 'src/server.js'];
  let content = '';

  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const code = fs.readFileSync(fullPath, 'utf8');
      content += `\n\n// File: ${file}\n${code}\n`;
    } else {
      content += `\n\n// File: ${file} (NÃO ENCONTRADO)\n`;
    }
  }

  return content;
}

(async () => {
  try {
    const codeToReview = readCodeFiles();

    console.log(' [AI Review] A chamar a API da OpenAI para rever o código...');


    // 3) Chamar a API de chat/completions 
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content:
            'És um revisor de código Node.js/Express. Foca-te em qualidade, boas práticas, segurança ' +
            'e clareza. Responde em português de Portugal, em poucos pontos objetivos.'
        },
        {
          role: 'user',
          content:
            'Faz uma revisão rápida de qualidade e boas práticas para o seguinte código. ' +
            'Dá uma resposta em 5 pontos objetivos:\n\n' +
            codeToReview
        }
      ],
      temperature: 0.2,
      max_tokens: 600
    });

    const aiText = response.choices[0].message.content;

    console.log(' Resposta da IA:');
    console.log(aiText);

  } catch (err) {
    console.error(' Erro ao chamar a API da OpenAI:');
    console.error(err.message || err);
    process.exit(1);
  }
})();
