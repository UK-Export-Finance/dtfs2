/**
 * replaceCharactersWithCharacterCode
 * Replace certain characters with character codes
 * @param {String} Field value
 * @returns {String}
 */
const replaceCharactersWithCharacterCode = (str) => {
  if (str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\*/g, '&#42;');
  }

  return '';
};

module.exports = { replaceCharactersWithCharacterCode };
