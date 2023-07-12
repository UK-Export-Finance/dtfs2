const validator = require('validator');

const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(mongoId) : false);

const isValidUkefNumericId = (ukefId) => {
  const id = parseInt(ukefId, 10);

  if (Number.isNaN(id)) {
    return false;
  }

  const regex = /^\d{10}$/;

  return regex.test(ukefId);
};

const isValidPartyUrn = (partyUrn) => {
  const regex = /^\d{8}$/;

  return regex.test(partyUrn);
};

const isValidNumericId = (numericId) => {
  const id = parseInt(numericId, 10);

  if (Number.isNaN(id)) {
    return false;
  }

  const regex = /^\d+$/;

  return regex.test(numericId);
};

const isValidCurrencyCode = (currencyCode) => (currencyCode ? validator.isISO4217(currencyCode) : false);

const sanitizeUsername = (username) => validator.escape(username);

module.exports = {
  isValidMongoId,
  isValidUkefNumericId,
  isValidPartyUrn,
  isValidNumericId,
  isValidCurrencyCode,
  sanitizeUsername,
};
