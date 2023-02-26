const api = require('../../../api');
const { userCanEdit, isEmptyString, partyType } = require('./helpers');
const validatePartyURN = require('./partyUrnValidation.validate');
const { hasAmendmentInProgressDealStage, amendmentsInProgressByDeal } = require('../../helpers/amendments.helper');
const CONSTANTS = require('../../../constants');

const { DEAL } = CONSTANTS;

/**
 * Renders all parties URN page
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @returns {Object} Express response, which renders all party URN page.
 */
const getAllParties = async (req, res) => {
  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);
  const { data: amendments } = await api.getAmendmentsByDealId(dealId);
  const { user } = req.session;

  if (!deal) {
    console.error('Invalid deal.');
    return res.redirect('/not-found');
  }

  const hasAmendmentInProgress = await hasAmendmentInProgressDealStage(amendments);
  if (hasAmendmentInProgress) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }
  const amendmentsInProgress = await amendmentsInProgressByDeal(amendments);

  const canEdit = userCanEdit(user);

  // Render all parties URN page
  return res.render('case/parties/parties.njk', {
    userCanEdit: canEdit,
    renderEditLink: canEdit,
    renderEditForm: false,
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    dealId,
    user,
    hasAmendmentInProgress,
    amendmentsInProgress,
  });
};

/**
 * Renders specific party URN edit page
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @returns {Object} Express response as rendered party page.
 */
const getPartyDetails = async (req, res) => {
  if (!req) {
    console.error('Invalid request received');
    return res.redirect('/not-found');
  }

  const { user } = req.session;
  const party = partyType(req.url);

  const canEdit = userCanEdit(user);

  if (!canEdit) {
    console.error('Invalid user privilege.');
    return res.redirect('/not-found');
  }

  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    console.error('Invalid deal.');
    return res.redirect('/not-found');
  }

  if (!party) {
    console.error('Invalid party type specified.');
    return res.redirect('/not-found');
  }

  return res.render(`case/parties/edit/${party}.njk`, {
    userCanEdit: canEdit,
    renderEditLink: false,
    renderEditForm: true,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId,
    user: req.session.user,
    urn: deal.tfm.parties[party].partyUrn,
  });
};

/**
 * Render's confirm party URN page
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @returns {Object} Express response as rendered confirm party URN page.
 */
const confirmPartyUrn = async (req, res) => {
  if (!req) {
    console.error('Invalid request received');
    return res.redirect('/not-found');
  }

  const party = partyType(req.url);
  const { user } = req.session;

  const canEdit = userCanEdit(user);

  if (!canEdit) {
    console.error('Invalid user privilege.');
    return res.redirect('/not-found');
  }

  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    console.error('Invalid deal.');
    return res.redirect('/not-found');
  }

  if (!party) {
    console.error('Invalid party type specified.');
    return res.redirect('/not-found');
  }

  return res.render(`case/parties/confirm/${party}.njk`, {
    userCanEdit: canEdit,
    renderEditLink: false,
    renderEditForm: true,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId,
    user: req.session.user,
    urn: deal.tfm.parties[party].partyUrn,
  });
};

/**
 * Submits party URN
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @returns {Object} Express response, if successful then re-directed to all parties page
 */
const postPartyDetails = async (req, res) => {
  if (!req) {
    console.error('Invalid request received');
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  delete req.body._csrf;

  if (!userCanEdit(user)) {
    return res.redirect('/not-found');
  }

  const dealId = req.params._id;

  const deal = await api.getDeal(dealId);

  if (!deal) {
    console.error('Invalid deal.');
    return res.redirect('/not-found');
  }

  const party = partyType(req.url);

  if (!party) {
    console.error('Invalid party type specified.');
    return res.redirect('/not-found');
  }

  /**
     * checks if `party` is exporter and if partyUrn input exists or is a blank string (nothing inputted)
     * validates input - should only be at least 3 numbers
     * validation error rendered if error exists on edit partyUrn page
     * if no error, then updates partyURN
     */
  if (req.body.partyUrn || isEmptyString(req.body.partyUrn)) {
    const urnValidationErrors = [];

    const partyUrnParams = {
      urnValue: req.body.partyUrn,
      partyUrnRequired: deal.tfm.parties[party].partyUrnRequired,
      // index not required for these fields as only 1 URN box on page
      index: null,
      party,
      urnValidationErrors,
    };

    // validates input
    const validationError = validatePartyURN(partyUrnParams);
    const canEdit = userCanEdit(user);

    if (validationError.errorsObject) {
      // Render all parties URN page
      return res.render('case/parties/parties.njk', {
        userCanEdit: canEdit,
        renderEditLink: false,
        renderEditForm: true,
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'parties',
        deal: deal.dealSnapshot,
        tfm: deal.tfm,
        dealId,
        user: req.session.user,
        errors: validationError.errorsObject.errors,
        urn: validationError.urn,
      });
    }
  }

  const update = {
    [party]: req.body,
  };

  await api.updateParty(dealId, update);

  return res.redirect(`/case/${dealId}/parties`);
};

const getBondIssuerPartyDetails = async (req, res) => {
  if (!req) {
    console.error('Invalid request received');
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const canEdit = userCanEdit(user);

  if (!canEdit) {
    console.error('Invalid user privilege.');
    return res.redirect('/not-found');
  }

  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    console.error('Invalid deal.');
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-issuer.njk', {
    userCanEdit: canEdit,
    renderEditLink: false,
    renderEditForm: true,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    user,
  });
};

const getBondBeneficiaryPartyDetails = async (req, res) => {
  if (!req) {
    console.error('Invalid request received');
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const canEdit = userCanEdit(user);

  if (!canEdit) {
    console.error('Invalid user privilege.');
    return res.redirect('/not-found');
  }

  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    console.error('Invalid deal.');
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-beneficiary.njk', {
    userCanEdit: canEdit,
    renderEditLink: false,
    renderEditForm: true,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    user,
  });
};

module.exports = {
  getPartyDetails,
  confirmPartyUrn,
  postPartyDetails,
  getAllParties,
  getBondIssuerPartyDetails,
  getBondBeneficiaryPartyDetails,
};
