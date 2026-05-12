# EduRecife — Backend

### API REST com arquitetura BFF para dados de matrículas escolares do Recife

Backend Node.js que consome dados públicos do Portal de Dados Abertos da Prefeitura do Recife, normaliza e agrega as informações, e expõe uma API REST documentada via Swagger para alimentar o dashboard educacional. Implementa o padrão Backend for Frontend (BFF) com cache em memória e pré-carregamento inteligente.

**Projeto desenvolvido como Teste Prático para a vaga de Analista de Inovação**
**Secretaria de Planejamento e Gestão · Prefeitura do Recife**

---

## API no ar

A API está hospedada em ambiente de produção e disponível para acesso imediato. **Não há necessidade de configuração local para avaliação**.

| Serviço | URL |
|---------|-----|
| **API + Documentação Swagger** | https://back-end-edu-rec.onrender.com |
| **Health check** | https://back-end-edu-rec.onrender.com/health |
| **Frontend** | https://edu-rec.vercel.app |
| **Repositório do Frontend** | https://github.com/Jorgefigueredoo/Front-End-Edu-Rec |

> **Pronto para testar:** Ao acessar a raiz da API, o avaliador é redirecionado automaticamente para o Swagger UI, onde pode testar todos os endpoints interativamente. Basta clicar em qualquer rota e em **"Try it out"**.

---

## Sobre a aplicação

O backend atua como uma **camada robusta de tratamento e abstração dos dados públicos**, garantindo que o frontend receba sempre informações limpas, normalizadas, agregadas e prontas para consumo direto.

São processados **105.702 registros reais de alunos matriculados** da rede municipal do Recife, disponibilizados em arquivos CSV pela Secretaria de Educação no Portal de Dados Abertos da Prefeitura.

### Por que um backend dedicado foi necessário?

Os dados públicos do Recife são disponibilizados em **CSV bruto**, apresentando várias inconsistências típicas de datasets governamentais que precisam ser tratadas antes de chegar ao frontend:

- **Volume elevado** — cada arquivo tem mais de 100 mil linhas (uma linha por aluno matriculado)
- **Encoding Windows-1252** — caracteres acentuados aparecem quebrados quando lidos como UTF-8
- **Campos em CAIXA ALTA** — nomes de escolas, bairros e endereços vêm em formato bruto
- **Distrito como número** — campo RPA vem como `"1"`, `"2"`, etc., precisando ser convertido para o formato `"RPA 1"`
- **Sem agregações prontas** — cada registro representa um único aluno, exigindo agrupamento por escola
- **Múltiplos arquivos** — um CSV separado por ano, exigindo orquestração para o gráfico de evolução

O backend resolve **todos esses problemas** em uma camada única, entregando JSON limpo e estruturado.

---

## Arquitetura BFF (Backend for Frontend)

```
┌──────────────────────┐      ┌─────────────────────────┐      ┌──────────────────────┐
│   Frontend (React)   │ ───► │   Backend Node/Express  │ ───► │  Portal de Dados     │
│   Vercel             │      │   API REST + Cache      │      │  Abertos do Recife   │
│   edu-rec.vercel.app │ ◄─── │   Render                │ ◄─── │  (CSV oficial)       │
└──────────────────────┘      └─────────────────────────┘      └──────────────────────┘
```

### Vantagens do padrão BFF aplicadas neste projeto

| Vantagem | Como se manifesta na prática |
|----------|------------------------------|
| **Frontend isolado** | A interface React não sabe que os dados vêm de CSVs — consome apenas endpoints REST limpos e tipados |
| **Lógica centralizada** | Encoding, parsing, agrupamento e normalização ficam todos no servidor, em uma única implementação |
| **Performance otimizada** | Cache em memória evita baixar 105 mil registros a cada requisição — apenas a primeira chamada vai até a fonte |
| **Flexibilidade futura** | Se o Portal mudar o formato dos dados, apenas o backend é afetado — o frontend não precisa de alteração |
| **Múltiplos consumidores** | A API pode ser consumida por outros clientes no futuro (app mobile nativo, outro dashboard, integrações) |
| **Endpoints específicos** | Cada endpoint retorna exatamente o que o frontend precisa, sem dados desnecessários |

---

## Endpoints

Todos os endpoints retornam JSON e seguem padrões REST. Os parâmetros de query são opcionais com valores padrão.

| Método | Endpoint | Descrição |
|:------:|----------|-----------|
| `GET` | `/health` | Health check para monitoramento de disponibilidade |
| `GET` | `/api/matriculas/resumo?ano=2024` | KPIs do dashboard (total de escolas, matrículas e média por escola) |
| `GET` | `/api/matriculas/escolas?ano=2024&distrito=RPA 1&busca=nome` | Lista de escolas agrupadas com filtros opcionais |
| `GET` | `/api/matriculas/distritos?ano=2024` | Matrículas agrupadas por distrito (RPA) para o gráfico de barras |
| `GET` | `/api/matriculas/evolucao` | Total de matrículas por ano (2020 a 2024) para o gráfico de linha |

A **documentação interativa completa** está disponível ao acessar a raiz da API, com possibilidade de testar cada endpoint diretamente pelo navegador:

https://back-end-edu-rec.onrender.com

### Exemplo de resposta — `GET /api/matriculas/resumo?ano=2024`

```json
{
  "ano": 2024,
  "totalEscolas": 432,
  "totalMatriculas": 105702,
  "mediaAlunos": 245
}
```

### Exemplo de resposta — `GET /api/matriculas/escolas?ano=2024`

```json
{
  "ano": 2024,
  "total": 432,
  "data": [
    {
      "codigoEscola": "004",
      "nomeEscola": "Professor Jose Da Costa Porto",
      "bairro": "Ilha Joana Bezerra",
      "endereco": "Cabo Eutropio",
      "numero": "660",
      "distrito": "RPA 1",
      "totalMatriculas": 846,
      "turnos": [
        { "nome": "INTEGRAL", "total": 549 },
        { "nome": "NOITE", "total": 126 },
        { "nome": "TARDE", "total": 86 },
        { "nome": "MANHÃ", "total": 85 }
      ],
      "modalidades": [
        { "nome": "ENSINO FUNDAMENTAL", "total": 720 },
        { "nome": "EDUCACAO JOVENS E ADULTOS", "total": 126 }
      ]
    }
  ]
}
```

### Exemplo de resposta — `GET /api/matriculas/evolucao`

```json
{
  "data": [
    { "ano": 2020, "totalMatriculas": 92341 },
    { "ano": 2021, "totalMatriculas": 95820 },
    { "ano": 2022, "totalMatriculas": 96154 },
    { "ano": 2023, "totalMatriculas": 98762 },
    { "ano": 2024, "totalMatriculas": 105702 }
  ]
}
```

---

## Estrutura em camadas

A organização segue o princípio de **separação de responsabilidades**, com cada camada cumprindo uma única função clara.

```
src/
├── server.js                        Entry point — sobe servidor e pré-carrega cache
├── app.js                           Express, CORS, Swagger e roteamento
├── routes/
│   └── matriculas.routes.js         Definição dos endpoints + documentação Swagger via JSDoc
├── controllers/
│   └── matriculas.controller.js     Recebe requisição, valida parâmetros, chama service
├── services/
│   └── matriculas.service.js        Lógica de negócio — download, parse, normalização, agrupamento
└── utils/
    ├── csvParser.js                 Converte CSV bruto em array de objetos JavaScript
    ├── dataSources.js               URLs dos CSVs oficiais do Portal do Recife
    └── swagger.js                   Configuração do OpenAPI 3 para documentação automática
```

### Responsabilidades por camada

| Camada | Responsabilidade |
|--------|-----------------|
| **routes** | Define os endpoints, parâmetros aceitos e documentação Swagger via JSDoc |
| **controllers** | Recebe a requisição HTTP, valida parâmetros e delega para o service correspondente |
| **services** | Implementa as regras de negócio — download dos CSVs, parsing, normalização e agregação |
| **utils** | Funções auxiliares puras e reutilizáveis — parser de CSV, fontes de dados, configurações |

Cada camada possui uma única responsabilidade, facilitando manutenção, testes e evolução do sistema.

---

## Decisões técnicas e justificativas

Cada decisão foi tomada com base em critérios de **performance, simplicidade, manutenibilidade e adequação ao contexto** de uma API pública.

| Decisão | Justificativa |
|---------|--------------|
| **Node.js + Express ao invés de Java/Spring** | Para um servidor de leitura e agregação de dados públicos, Node oferece setup mais simples, deploy mais rápido e menor consumo de memória — ideal para o plano gratuito do Render (512MB). Como a aplicação é I/O bound (faz muito network), o modelo assíncrono do Node é mais eficiente do que threads do Java |
| **Padrão BFF** | O frontend recebe dados já tratados e normalizados. A complexidade de parsing, encoding e agrupamento fica isolada no servidor, com endpoints específicos para cada necessidade da interface |
| **Cache em memória (Object)** | Os CSVs do Portal do Recife têm 105 mil linhas cada. Sem cache, cada requisição faria o download completo. Com cache, apenas a primeira requisição é "cara" — as seguintes são instantâneas |
| **Pré-carregamento no startup** | O servidor já baixa e cacheia os dados do ano corrente assim que sobe. Quando o primeiro usuário acessa, os dados já estão prontos — eliminando o cold start perceptível pelo usuário |
| **Sem banco de dados** | A aplicação é somente leitura — os dados públicos são a fonte da verdade. Adicionar um banco traria complexidade desnecessária, custo de hospedagem e ponto de falha sem agregar valor real |
| **Encoding Windows-1252 com Buffer/latin1** | Os CSVs do Recife são exportados em Windows-1252 (legado). O backend faz a conversão correta para UTF-8 antes do parsing, garantindo caracteres acentuados corretos como "MANHÃ", "CORREÇÃO" |
| **Swagger com swagger-jsdoc** | Documentação gerada automaticamente a partir de comentários JSDoc nas rotas — sempre sincronizada com a implementação real, sem manutenção manual. Permite teste interativo dos endpoints |
| **Redirect da raiz para /api-docs** | Quando o avaliador acessa a URL principal do backend, é levado diretamente para a documentação interativa. Melhora a experiência de quem está conhecendo a API |
| **NODE_OPTIONS=--max-old-space-size=400** | Limita o heap do Node a 400MB, deixando 112MB de folga para o sistema operacional dentro dos 512MB do plano gratuito do Render |
| **CORS configurado via env** | A origem permitida vem da variável de ambiente, separando o ambiente de desenvolvimento (localhost) do de produção (Vercel) — princípio de configuração externalizada |
| **Health check endpoint** | Endpoint dedicado e leve para verificação de disponibilidade, sem processar dados |
| **Arquivos por tipo (routes/controllers/services)** | Estrutura previsível que qualquer desenvolvedor Node reconhece imediatamente, facilitando onboarding |

---

## Tratamento de dados

Os CSVs do Portal do Recife apresentam várias inconsistências que precisam ser tratadas antes de chegar ao frontend. O backend resolve cada uma delas de forma transparente.

| Problema na fonte | Tratamento no backend |
|-------------------|----------------------|
| **Cada linha representa 1 aluno** (105 mil linhas) | Agrupamento por código de escola somando matrículas e mantendo metadados |
| **Encoding Windows-1252** ("MANHÃf" no lugar de "MANHÃ") | Conversão correta usando `Buffer.toString('latin1')` |
| **Nomes em CAIXA ALTA** ("ESCOLA MUNICIPAL JOÃO DA SILVA") | Função `toTitleCase` converte para "Escola Municipal João Da Silva" |
| **Distrito como número** (campo `RPA: "1"`) | Concatenação para `"RPA 1"` no formato de apresentação |
| **Campos com aspas extras** | Limpeza usando `replace(/"/g, '').trim()` |
| **Turnos e modalidades misturados** | Agrupamento secundário dentro de cada escola, criando estruturas detalhadas para o modal de detalhe |
| **Múltiplos CSVs (um por ano)** | Função `evolucaoAnual` itera por todos os anos e agrega o total para o gráfico de linha |
| **Endereço sem número** | Fallback para `"S/N"` quando o campo número está vazio |

---

## Fonte dos dados

| Dataset | Fonte oficial | Anos disponíveis | Volume |
|---------|--------------|------------------|--------|
| Matrículas rede municipal | [Portal de Dados Abertos do Recife](https://dados.recife.pe.gov.br/dataset/alunos-matriculados-2023) | 2020 — 2024 | ~105 mil registros/ano |

Os CSVs são consumidos diretamente das URLs oficiais — **sem cópia local, sem mock, sem dados fictícios**. A aplicação reflete em tempo real o que está publicado pela Secretaria de Educação do Recife.

---

## Stack tecnológica

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| Node.js | 20 | Runtime JavaScript do lado servidor |
| Express | 4 | Framework HTTP minimalista e amplamente usado |
| csv-parse | 5 | Parser robusto de arquivos CSV |
| axios | 1 | Cliente HTTP para download dos CSVs |
| swagger-ui-express | 5 | Interface visual interativa do Swagger |
| swagger-jsdoc | 6 | Geração de OpenAPI 3 a partir de comentários JSDoc |
| cors | 2 | Middleware para gerenciar Cross-Origin Resource Sharing |
| dotenv | 16 | Carregamento de variáveis de ambiente |
| nodemon | 3 | Hot reload em desenvolvimento |
| Render | — | Plataforma de deploy e hospedagem |

---

## Como rodar localmente

### Pré-requisitos
- Node.js 18 ou superior

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/Jorgefigueredoo/Back-End-Edu-Rec.git
cd Back-End-Edu-Rec

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Rodar em desenvolvimento (com hot reload)
npm run dev
# Servidor sobe em http://localhost:3001

# 5. Rodar em produção
npm start
```

### Variáveis de ambiente

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_OPTIONS=--max-old-space-size=400
```

### URLs após subir o servidor

- **API + Documentação Swagger:** http://localhost:3001
- **Health check:** http://localhost:3001/health

---

## Estrutura completa do projeto

```
Back-End-Edu-Rec/
├── src/
│   ├── controllers/
│   │   └── matriculas.controller.js
│   ├── routes/
│   │   └── matriculas.routes.js
│   ├── services/
│   │   └── matriculas.service.js
│   ├── utils/
│   │   ├── csvParser.js
│   │   ├── dataSources.js
│   │   └── swagger.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Deploy

A API está hospedada na plataforma **Render** com deploy automático configurado a partir do branch principal.

### Configuração no Render
- **Tipo:** Web Service
- **Runtime:** Node
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Variáveis de ambiente configuradas:**
  - `FRONTEND_URL` — URL do frontend na Vercel
  - `NODE_OPTIONS` — Limite de memória do heap

Cada push para o repositório dispara um novo deploy automaticamente.

---

## Links relacionados

- **Repositório do frontend:** https://github.com/Jorgefigueredoo/Front-End-Edu-Rec
- **Portal de Dados Abertos do Recife:** https://dados.recife.pe.gov.br
- **Prefeitura do Recife:** https://www2.recife.pe.gov.br
- **Secretaria de Planejamento e Gestão:** https://www2.recife.pe.gov.br/orgao/secretaria-de-planejamento-e-gestao

---

## Autor

**Jorge Figueredo**
Candidato à vaga de Analista de Inovação — Prefeitura do Recife

- GitHub: [@Jorgefigueredoo](https://github.com/Jorgefigueredoo)
