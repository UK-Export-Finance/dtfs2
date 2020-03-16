const builder = require('../builder');

module.exports = (overrides) => {

  const template = {
    code: "ATG",
    name: "Antigua and Barbuda"
  };

  return builder(template, overrides);
}
