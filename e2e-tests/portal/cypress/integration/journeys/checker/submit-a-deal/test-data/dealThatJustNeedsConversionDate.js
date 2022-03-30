const { ObjectID } = require('bson');
const template = require('./template.json');

module.exports = () => {
  const deal = { ...template };

  deal.mockFacilities[0]._id = ObjectID();
  deal.mockFacilities[0]._id = ObjectID();

  return deal;
};
