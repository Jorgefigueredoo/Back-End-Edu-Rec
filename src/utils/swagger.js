const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduRecife API',
      version: '1.0.0',
      description:
        'API BFF para visualização de dados de matrículas escolares do município do Recife. Fonte: Portal de Dados Abertos da Prefeitura do Recife.',
      contact: {
        name: 'Portal de Dados Abertos do Recife',
        url: 'https://dados.recife.pe.gov.br',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Desenvolvimento',
      },
      {
        url: 'https://seu-backend.onrender.com',
        description: 'Produção',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.routes.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;