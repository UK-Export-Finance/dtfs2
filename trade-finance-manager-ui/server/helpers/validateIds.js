const validator = require('validator');

const isValidMongoId = (mongoId) => {
  if (!mongoId) {
    return false;
  }
  return validator.isMongoId(mongoId);
};

const isValidPartyUrn = (partyUrn) => {
  const regex = /^[0-9]{8}$/;

  if (regex.test(partyUrn)) {
    return true;
  }

  return false;
};

module.exports = {
  isValidMongoId,
  isValidPartyUrn,
};
