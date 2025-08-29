const winston = require('winston');

// Created a custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Created the logger
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'student-marks-api' },
  transports: [
    // Single file for all logs (info, warn, error)
    new winston.transports.File({ 
      filename: 'logs/app.log',
      maxsize: 10485760, // 10MB
      maxFiles: 3
    }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// Commented out to reduce console noise - only essential messages will be shown
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.simple()
//     )
//   }));
// }

// Helper functions for different log levels
const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

const logError = (message, error = null, meta = {}) => {
  if (error) {
    meta.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  logger.error(message, meta);
};

const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

module.exports = {
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug
};
