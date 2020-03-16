const builder = require('../builder');

module.exports = (overrides) => {

  const template = {
    id: "CAD",
    text: "CAD - Canadian Dollars"
  };

  return builder(template, overrides);
}
