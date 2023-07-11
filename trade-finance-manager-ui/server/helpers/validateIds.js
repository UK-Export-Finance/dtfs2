const validator = require('validator');

const isValidMongoId = (mongoId) => {
  if (!mongoId) {
    return false;
  }
  return validator.isMongoId(mongoId);
};

const isValidPartyUrn = (partyUrn) => {
  const regex = /^\d{8}$/;

  return regex.test(partyUrn);
};

module.exports = {
  isValidMongoId,
  isValidPartyUrn,
};
