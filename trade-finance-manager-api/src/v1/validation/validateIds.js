const { ObjectId } = require('mongodb');

const validMongoId = (mongoId) => {
  if (!ObjectId.isValid(mongoId)) {
    return false;
  }

  return mongoId;
};

const validUkefNumericId = (ukefId) => {
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

const validPartyUrn = (partyUrn) => {
  const regex = /^[0-9]{8}$/;

  if (!regex.test(partyUrn)) {
    return false;
  }

  return partyUrn;
};

const validNumericId = (numericId) => {
  const id = parseInt(numericId);

  if (Number.isNaN(id)) {
    return false;
  }

  return numericId;
}

module.exports = {
  validMongoId,
  validUkefNumericId,
  validPartyUrn,
  validNumericId,
};
