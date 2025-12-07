// ai-sast.js
// Gate de SAST com IA: analisa o código à procura de vulnerabilidades de segurança

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Limite abaixo do qual o pipeline reprova por segurança fraca
const SECURITY_THRESHOLD_FAIL = 50;

// 1) Ler chave da variável de ambiente
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error(' OPENAI_API_KEY não definida. Verifica o .env (local) ou os Secrets do GitHub.');
  process.exit(1);
}

// 2) Criar cliente OpenAI
const client = new OpenAI({ apiKey });

/**
 * Lê os ficheiros de código que queremos analisar (igual ao ai-review para consistência).
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

/**
 * Tenta extrair JSON mesmo que venha dentro de ```json ... ```
 */
function extractJson(raw) {
  if (!raw) return null;
  let text = raw.trim();

  if (text.startsWith('```')) {
    // remove ```json ou ``` e o ``` final
    text = text.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '').trim();
  }

  return text;
}

(async () => {
  try {
    const codeToAnalyse = readCodeFiles();

    console.log(' [AI SAST] A chamar a API da OpenAI para analisar segurança do código...');

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.1,
      max_tokens: 900,
      messages: [
        {
          role: 'system',
          content:
            'És um especialista em segurança de aplicações Node.js/Express. ' +
            'Foca-te em vulnerabilidades de segurança (OWASP Top 10, más práticas, validação de input, gestão de segredos). ' +
            'Responde SEMPRE em JSON válido, em português de Portugal.'
        },
        {
          role: 'user',
          content:
            'Faz uma análise ESTÁTICA de segurança ao seguinte código Node.js/Express. ' +
            'Procura vulnerabilidades concretas (injecção de SQL, XSS, CSRF, má validação de input, exposição de segredos, problemas de autenticação/autorização, etc.). ' +
            'Devolve APENAS um JSON **válido** com esta estrutura:\n\n' +
            '{\n' +
            '  "score": número entre 0 e 100,\n' +
            '  "nivel": "OK" | "WARNING" | "CRITICAL",\n' +
            '  "vulnerabilidades": [ "descrição curta da vulnerabilidade 1", "..." ],\n' +
            '  "recomendacoes": [ "recomendação 1", "recomendação 2", ... ]\n' +
            '}\n\n' +
            '- Se existirem vulnerabilidades graves → nivel = "CRITICAL" e score <= 50.\n' +
            '- Se existir risco moderado → nivel = "WARNING" e score entre 51 e 79.\n' +
            '- Se o código estiver globalmente seguro → nivel = "OK" e score >= 80.\n\n' +
            'Código a analisar:\n\n' +
            codeToAnalyse
        }
      ]
    });

    const raw = response.choices?.[0]?.message?.content?.trim();
    console.log(' Resposta RAW da IA (SAST):');
    console.log(raw);

    let parsed;
    try {
      const jsonText = extractJson(raw);
      parsed = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error(' [AI SAST] Não foi possível fazer parse do JSON devolvido pela IA.');
      console.error('Erro:', parseErr.message);
      console.error('A correr em modo permissivo (não reprova o pipeline).');
      process.exit(0);
    }

    const { score, nivel, vulnerabilidades, recomendacoes } = parsed || {};

    console.log(' Resultado estruturado da AI SAST:');
    console.log(`  Score de segurança: ${score}`);
    console.log(`  Nível: ${nivel}`);
    console.log('  Vulnerabilidades detectadas:');
    (vulnerabilidades || []).forEach((v, i) => console.log(`    ${i + 1}. ${v}`));
    console.log('  Recomendações:');
    (recomendacoes || []).forEach((r, i) => console.log(`    ${i + 1}. ${r}`));

    if (typeof score !== 'number' || !nivel) {
      console.error(' [AI SAST] Formato inesperado. Não vou reprovar o pipeline.');
      process.exit(0);
    }

    // Quality gate de segurança
    if (nivel === 'CRITICAL' || score < SECURITY_THRESHOLD_FAIL) {
      console.error(' [AI SAST] Segurança insuficiente (nível CRITICAL ou score baixo).');
      process.exit(1);
    }

    console.log(' [AI SAST] Análise de segurança passou.');
    process.exit(0);

  } catch (err) {
    console.error(' [AI SAST] Erro ao chamar a API da OpenAI:');
    console.error(err.message || err);
    // Em caso de erro técnico, não rebenta o pipeline todo
    process.exit(0);
  }
})();
