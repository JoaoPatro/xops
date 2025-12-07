# Projeto XOPS – Pipeline CI/CD, Testes, Segurança e Observabilidade

Este repositório corresponde ao trabalho final da UC XOPS. O objetivo foi criar uma aplicação simples em Node.js e montar à volta dela uma pipeline CI/CD completa, com testes, verificações de segurança e um painel básico de monitorização. A aplicação em si é pequena, porque o foco principal foi mesmo aprender a parte DevSecOps.


## Objetivos do projeto

O projeto cumpre os requisitos pedidos no enunciado:

- Aplicação web simples em Node.js + Express  
- Rotas básicas (`/`, `/users`, `/about`)  
- Dashboard de monitorização  
- Testes automáticos com Jest  
- DAST para testar vulnerabilidades enquanto a API está a correr  
- AI-SAST (análise estática assistida por IA)  
- AI Code Review integrado na pipeline  
- Pipeline CI/CD no GitHub Actions  
- Relatório de cobertura dos testes  

Tudo isto é executado automaticamente sempre que há um push ou um pull request.


## Estrutura do Projeto


/public
├── about.html
├── monitor.html # Dashboard de monitorização (observability layer)
/src
├── index.js # Aplicação Express com rotas e healthcheck
└── server.js # Arranque do servidor
/tests
└── app.test.js # Testes Jest
/scripts
├── dast-scan.js # DAST
├── ai-sast.js # SAST security gate
└── ai-review.js # AI code review
.github/workflows
└── main.yml # Pipeline CI/CD completa


## Funcionalidades principais

- **GET /** – rota principal usada nos testes e no painel.
- **GET /users** – devolve uma pequena lista de utilizadores de exemplo.
- **GET /about** – página HTML estática.
- **GET /monitor** – mostra o painel de observabilidade.


## Observabilidade

O projeto tem um painel simples (`monitor.html`) que faz pedidos à API a cada poucos segundos e mostra:

- estado da API  
- uptime  
- timestamp da última resposta  



## Testes (Jest)

Foram criados testes para:

- garantir que `/` responde com o JSON esperado  
- garantir que `/users` devolve um array  

Os testes correm localmente e também automaticamente no GitHub Actions.


## Segurança – DAST e AI-SAST

### DAST  
Usa o script `dast-scan.js`, que envia vários payloads maliciosos (SQL injection, XSS, etc.).  
A pipeline falha se acontecer algum erro 500 ou se houver XSS refletido.

### AI-SAST  
O script `ai-sast.js` envia o código para a API da OpenAI, que faz uma análise estática e devolve:

- score de segurança  
- nível de alerta  
- vulnerabilidades encontradas  

Se o nível for "CRITICAL" ou o score for baixo, a pipeline falha.


## Pipeline CI/CD

A pipeline (`.github/workflows/main.yml`) faz:

1. checkout do código  
2. instala dependências  
3. corre testes + cobertura  
4. guarda relatórios  
5. corre o DAST  
6. corre IA Code Review  
7. corre AI-SAST  

Se alguma etapa obrigatória falhar, o PR/push é bloqueado.


## Autores

João Patrocínio e João Silva.
