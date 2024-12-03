const xss = require('xss');

const cleanXss = (req, res, next) => {
  const body = JSON.stringify(req.body);
  req.body = JSON.parse(xss(body));
  next();
};

module.exports = cleanXss;
