const escapeStringRegexp = require('escape-string-regexp');

const getEscapedRegexFromString = (string) => new RegExp(`^${escapeStringRegexp(string)}$`, 'i');

module.exports = getEscapedRegexFromString;
