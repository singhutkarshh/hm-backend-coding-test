'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path')

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
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/docs', express.static(path.join(__dirname, 'docs')))
app.use("/docs/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));



const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

/* 
 - Routes from app.js should be imported outside serialize function.
 - Changed following app.js import name from app -> appRoutes as app was already used in upperScope at line 8. 
*/
const appRoutes = require('./src/app')(db);

// Added middlewares(such as jsonParser and appRoutes) that were imported but not used.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(jsonParser);
app.use(appRoutes);


db.serialize(() => {
    buildSchemas(db);

    app.listen(port, () => console.log(`App started and listening on port ${port}`));
});