const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, errors, json,
} = format;

const buildLogger = () => {
  const logger = createLogger({
    format: combine(
      timestamp(),
      errors({ stack: true }),
      json(),
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
      new transports.File({ filename: './logs/info.logs' })],
  });
  return logger;
};

module.exports = buildLogger;
