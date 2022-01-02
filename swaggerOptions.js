// Options for Swagger OpenApi
module.exports = {
  swaggerDefinition: {
    info: {
      title: 'API Documentation',
      description: 'It contains all information related to APIs used in the module.',
      contact: {
        name: 'Developer',
      },
      servers: ['https://localhost:8010'],
    },
  },
  apis: ['src/app.js'],
};
