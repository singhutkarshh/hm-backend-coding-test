const buildLogger = require('./logger');

let logger = null;
logger = buildLogger();

module.exports = logger;
