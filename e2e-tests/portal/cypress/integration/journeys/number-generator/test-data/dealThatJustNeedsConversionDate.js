const template = require('./template.json');

module.exports = () => {
  const deal = JSON.parse(JSON.stringify(template));
  return deal;
};
