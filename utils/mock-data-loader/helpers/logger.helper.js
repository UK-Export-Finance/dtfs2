const LOGGER_COLOURS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const logger = ({ message, depth = 0, colour = null }) => {
  const indent = ' '.repeat(4 * depth);

  let formattedMessage = message;

  if (depth === 0) {
    formattedMessage = `\n${message}`;
  }

  const lines = formattedMessage.split('\n');
  lines.forEach((line) => {
    console.info(`${colour ? colour : ''}${indent}${line}${colour ? LOGGER_COLOURS.reset : ''}`);
  });
};

module.exports = {
  LOGGER_COLOURS,
  logger,
};
