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
const getAmendmentBankDecision = async (deal, amendment, user) => {
  const userCanEdit = canUserEditBankDecision(
    user,
    amendment.amendments,
  );

  return {
    userCanEdit,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user,
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
  const {
    _id: dealId,
    amendmentId,
    facilityId,
  } = req.params;
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

  if (!userCanEdit) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/amendments/amendment-banks-decision/amendment-edit-banks-decision.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user,
    amendment,
  });
};

module.exports = {
  getAmendmentBankDecision,
  getBanksDecisionEdit,
};
