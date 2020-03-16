const builder = require('../builder');

module.exports = (overrides) => {

  const template = {
    id: "9",
    name: "UKEF test bank (Delegated)"
  };
  
  return builder(template, overrides);
}
