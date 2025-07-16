// loggers.js
const winston = require('winston');
const { combine, timestamp, json, prettyPrint } = winston.format;

winston.loggers.add('MessageLogger', {
  level: 'debug',
  format: combine(timestamp(), json(), prettyPrint()),
  transports: [
    new winston.transports.File({ filename: 'logs/messages.log' }),
  ],
  defaultMeta: { service: 'ChatService' }
});
