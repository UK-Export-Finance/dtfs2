const validator = require('validator');

const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(mongoId) : false);

const isValidPartyUrn = (partyUrn) => {
  const regex = /^\d{8}$/;

  return regex.test(partyUrn);
};

module.exports = {
  isValidMongoId,
  isValidPartyUrn,
};
