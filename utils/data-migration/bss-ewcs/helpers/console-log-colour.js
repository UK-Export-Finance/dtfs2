const COLOURS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
};

const consoleLogColor = (msg, colour = 'red') => {
  console.info(COLOURS[colour], msg, COLOURS.reset);
};

module.exports = consoleLogColor;
