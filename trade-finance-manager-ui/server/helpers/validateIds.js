const validator = require('validator');

const isValidMongoId = (mongoId) => validator.isMongoId(mongoId);

const isValidPartyUrn = (partyUrn) => {
  const regex = /^[0-9]{8}$/;

  if (!regex.test(partyUrn)) {
    return false;
  }

  return partyUrn;
};

module.exports = {
  isValidMongoId,
  isValidPartyUrn,
};
