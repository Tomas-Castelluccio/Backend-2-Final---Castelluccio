const config = require("../../config/config");

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const threshold = LEVELS[config.LOG_LEVEL] ?? LEVELS.info;

const format = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const label = level.toUpperCase().padEnd(5);
  const details = meta ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} ${label} ${message}${details}`;
};

const write = (level, stream, message, meta) => {
  if (LEVELS[level] > threshold) return;
  stream(format(level, message, meta));
};

const logger = {
  error: (message, meta) => write("error", console.error, message, meta),
  warn: (message, meta) => write("warn", console.warn, message, meta),
  info: (message, meta) => write("info", console.log, message, meta),
  debug: (message, meta) => write("debug", console.log, message, meta),
};

module.exports = logger;