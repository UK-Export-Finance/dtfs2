const { isEmptyString } = require('../helpers/string');

const sentenceCase = (text) => {
  // Invalid `text` check
  if (isEmptyString(text) || typeof text !== 'string') {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
};

module.exports = sentenceCase;
