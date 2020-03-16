const builder = require('../builder');

module.exports = (overrides) => {

  const template = {
    "title":"Credit",
    "items":[{
      "id":5,
      "copy":"The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one- year probability of default of less than 14.1%."
    }]
  };

  return builder(template, overrides);
}
