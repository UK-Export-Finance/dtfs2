const { xss } = require('express-xss-sanitizer');

module.exports = {
  sanitizeXss: () => xss({ allowedTags: [''] }),
};
