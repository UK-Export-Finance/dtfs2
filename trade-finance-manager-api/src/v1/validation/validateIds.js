const validator = require('validator');

const isValidMongoId = (mongoId) => {
  if (!mongoId) {
    return false;
  }
  return validator.isMongoId(mongoId);
};

const isValidUkefNumericId = (ukefId) => {
  const id = parseInt(ukefId, 10);

  if (Number.isNaN(id)) {
    return false;
  }

  const regex = /^[0-9]{10}$/;

  if (!regex.test(ukefId)) {
    return false;
  }

  return true;
};

const isValidPartyUrn = (partyUrn) => {
  const regex = /^[0-9]{8}$/;

  if (regex.test(partyUrn)) {
    return true;
  }

  return false;
};

const isValidNumericId = (numericId) => {
  const id = parseInt(numericId, 10);

  if (Number.isNaN(id)) {
    return false;
  }

  const regex = /^\d+$/;

  if (!regex.test(numericId)) {
    return false;
  }

  return true;
};

const isValidCurrencyCode = (currencyCode) => {
  if (!currencyCode) {
    return false;
  }
  return validator.isISO4217(currencyCode);
};

module.exports = {
  isValidMongoId,
  isValidUkefNumericId,
  isValidPartyUrn,
  isValidNumericId,
  isValidCurrencyCode,
};
