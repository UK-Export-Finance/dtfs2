const validator = require('validator');
const teams = require('../../constants/teams');

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

const isValidTeamId = (teamId) => {
  const teamIds = [
    teams.BUSINESS_SUPPORT.id,
    teams.PIM.id,
    teams.RISK_MANAGERS.id,
    teams.UNDERWRITERS.id,
    teams.UNDERWRITER_MANAGERS.id,
    teams.UNDERWRITING_SUPPORT.id
  ];
  return teamIds.includes(teamId);
};

module.exports = {
  isValidMongoId,
  isValidUkefNumericId,
  isValidPartyUrn,
  isValidNumericId,
  isValidCurrencyCode,
  sanitizeUsername,
  isValidTeamId,
};
