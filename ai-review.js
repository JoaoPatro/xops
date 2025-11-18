// ai-review.js
// Script que faz uma chamada REAL à API da OpenAI para rever o código
// e atuar como quality gate (falha o pipeline se a qualidade for má)

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Limite abaixo do qual o pipeline reprova
const SCORE_THRESHOLD_FAIL = 40;

// 1) Ler chave da variável de ambiente
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ OPENAI_API_KEY não definida. Verifica o .env (local) ou os Secrets do GitHub.');
  process.exit(1);
}

// 2) Criar cliente OpenAI
const client = new OpenAI({ apiKey });

/**
 * Lê os ficheiros de código que queremos rever.
 * Aqui uso src/index.js e src/server.js como exemplo.
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

    console.log('🤖 [AI Review] A chamar a API da OpenAI para rever o código...');
    console.log('----------------------------------------');

    // 3) Chamar a API de chat/completions (modelo moderno)
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content:
            'És um revisor de código Node.js/Express. Foca-te em qualidade, boas práticas, segurança ' +
            'e clareza. Responde SEMPRE em JSON válido, em português de Portugal.'
        },
        {
          role: 'user',
          content:
            'Vais rever o seguinte código Node.js/Express. ' +
            'Analisa qualidade, boas práticas, segurança e clareza. ' +
            'Devolve APENAS um JSON **válido** com esta estrutura:\n\n' +
            '{\n' +
            '  "score": número entre 0 e 100,\n' +
            '  "nivel": "OK" | "WARNING" | "CRITICAL",\n' +
            '  "comentarios": [ "ponto 1", "ponto 2", ... ],\n' +
            '  "sugestoes": [ "sugestão 1", "sugestão 2", ... ]\n' +
            '}\n\n' +
            '- Se o código tiver problemas graves de segurança ou organização séria → nivel = "CRITICAL" e score <= 40.\n' +
            '- Se for aceitável mas com várias melhorias → nivel = "WARNING" e score entre 41 e 79.\n' +
            '- Se estiver globalmente bom → nivel = "OK" e score >= 80.\n\n' +
            'Código a rever:\n\n' +
            codeToReview
        }
      ],
      temperature: 0.2,
      max_tokens: 700
    });

    const raw = response.choices?.[0]?.message?.content?.trim();
console.log('📦 Resposta RAW da IA:');
console.log(raw);
console.log('----------------------------------------');

let result;
try {
  result = JSON.parse(raw);

    } catch (parseErr) {
      console.error('⚠️ Não foi possível fazer parse do JSON devolvido pela IA.');
      console.error('Erro:', parseErr.message);
      console.error('A correr em modo de aviso (não reprova o pipeline).');
      process.exit(0);
    }

    const { score, nivel, comentarios, sugestoes } = result || {};

    console.log('📊 Resultado estruturado da AI Review:');
    console.log(`  Score: ${score}`);
    console.log(`  Nível: ${nivel}`);
    console.log('  Comentários:');
    (comentarios || []).forEach((c, i) => console.log(`    ${i + 1}. ${c}`));
    console.log('  Sugestões:');
    (sugestoes || []).forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
    console.log('----------------------------------------');

    // Se não houver score/nivel válidos, não falha o pipeline
    if (typeof score !== 'number' || !nivel) {
      console.error('⚠️ AI Review devolveu um formato inesperado. Não vou reprovar o pipeline.');
      process.exit(0);
    }

    // Decisão do quality gate
    if (nivel === 'CRITICAL' || score < SCORE_THRESHOLD_FAIL) {
      console.error('❌ AI Review reprovou o código (nível CRITICAL ou score baixo).');
      process.exit(1);
    }

    console.log('✅ AI Review passou (código aceitável segundo a IA).');
    process.exit(0);

  } catch (err) {
    console.error('❌ Erro ao chamar a API da OpenAI:');
    console.error(err.message || err);
    // Em caso de erro técnico na IA, nao rebenta o pipeline todo 
    process.exit(0);
  }
})();
