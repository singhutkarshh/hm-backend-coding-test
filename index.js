// 'use strict' is no more needed since eslint will take care of unused/undefined variables etc.

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 8010;
const jsonParser = bodyParser.json();

/* Creating and serving documentation using jsdocs and swagger openApi
    Docs url : root-url/docs
    APIs url : root-url/docs/api-docs
*/
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swaggerOptions');

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', express.static(path.join(__dirname, 'docs')));
app.use('/docs/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

/*
 - Routes from app.js should be imported outside serialize function.
 - Changed following app.js import name from app -> appRoutes
   since app was already used in upperScope.
*/
const appRoutes = require('./src/app')(db);

// Added middlewares(such as jsonParser and appRoutes) that were imported but not used.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);
app.use(appRoutes);

// logger setup
const logger = require('./logs/index');

// logger.warn('text warn');
// logger.error('text error');

db.serialize(() => {
  buildSchemas(db);
  // console logs changed into winston logs
  // eslint-disable-next-line no-console
  app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
