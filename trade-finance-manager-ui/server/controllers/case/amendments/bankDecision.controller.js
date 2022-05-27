const { userCanEditBankDecision } = require('./helpers');

/**
 * @param {Object} deal
 * @param {Object} amendment
 * @param {Object} user
 * @returns {Object}
 * checks if user can edit bank decision
 * if true, then returns object containing userCanEdit flag
 */
const getAmendmentBankDecision = async (amendment, user) => {
  const isEditable = userCanEditBankDecision(user, amendment);

  return {
    isEditable,
    dealId: amendment.dealId,
    facilityId: amendment.facilityId,
    amendmentId: amendment.amendmentId,
    underwriterManagersDecision: amendment.underwriterManagersDecision,
    banksDecision: amendment.banksDecision,
    amendment,
  };
};

module.exports = { getAmendmentBankDecision };
