const { ObjectId } = require('mongodb');

const isValidMongoId = (mongoId) => ObjectId.isValid(mongoId);

const isValidUkefNumericId = (ukefId) => {
  const id = parseInt(ukefId, 10);

  if (Number.isNaN(id)) {
    return false;
  }

  const regex = /^[0-9]{10}$/;

  if (!regex.test(ukefId)) {
    return false;
  }

  return ukefId;
};

const isValidPartyUrn = (partyUrn) => {
  const regex = /^[0-9]{8}$/;

  if (!regex.test(partyUrn)) {
    return false;
  }

  return partyUrn;
};

const isValidNumericId = (numericId) => {
  const id = parseInt(numericId);

  if (Number.isNaN(id)) {
    return false;
  }

  return numericId;
}

module.exports = {
  isValidMongoId,
  isValidUkefNumericId,
  isValidPartyUrn,
  isValidNumericId,
};
