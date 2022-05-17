const api = require('../../../../../api');

const { canUserEditBankDecision } = require('../helpers');

/**
 * @param {Object} deal
 * @param {Object} amendment
 * @param {Object} user
 * @returns {Object}
 * checks if user can edit bank decision
 * if true, then returns object containing userCanEdit flag
 */
const getAmendmentBankDecision = async (amendment, user) => {
  const userCanEdit = canUserEditBankDecision(
    user,
    amendment,
  );

  return {
    userCanEdit,
    dealId: amendment.dealId,
    facilityId: amendment.facilityId,
    amendmentId: amendment.amendmentId,
    underwriterManagersDecision: amendment.underwriterManagersDecision,
    banksDecision: amendment.banksDecision,
    amendment,
  };
};

/**
 * @param {*} req
 * @returns {*} res
 * gets deal and amendment by id
 * checks if can be editted, and if so, then renders template
 */
const getBanksDecisionEdit = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const deal = await api.getDeal(dealId);

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment.amendmentId || !deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const userCanEdit = canUserEditBankDecision(
    user,
    amendment,
  );

  return res.render('case/amendments/underwriting/amendment-banks-decision/amendment-edit-banks-decision.njk', {
    amendment,
    dealId,
    userCanEdit,
  });
};

module.exports = {
  getAmendmentBankDecision,
  getBanksDecisionEdit,
};
