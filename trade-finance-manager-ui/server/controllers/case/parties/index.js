const api = require('../../../api');
const { userCanEdit, isEmptyString } = require('./helpers');
const validatePartyURN = require('./partyUrnValidation.validate');
const { hasAmendmentInProgressDealStage, amendmentsInProgressByDeal } = require('../../helpers/amendments.helper');
const CONSTANTS = require('../../../constants');

const { DEAL } = CONSTANTS;

const getCaseParties = async (req, res) => {
  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);
  const { data: amendments } = await api.getAmendmentsByDealId(dealId);
  const { user } = req.session;

  if (!deal) {
    return res.redirect('/not-found');
  }

  const hasAmendmentInProgress = await hasAmendmentInProgressDealStage(amendments);
  if (hasAmendmentInProgress) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }
  const amendmentsInProgress = await amendmentsInProgressByDeal(amendments);

  const canEdit = userCanEdit(user);

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

const getPartyDetails = (partyType) => (
  async (req, res) => {
    const { user } = req.session;

    const canEdit = userCanEdit(user);

    if (!canEdit) {
      return res.redirect('/not-found');
    }

    const dealId = req.params._id;
    const deal = await api.getDeal(dealId);

    if (!deal) {
      return res.redirect('/not-found');
    }

    return res.render(`case/parties/edit/${partyType}-edit.njk`, {
      userCanEdit: canEdit,
      renderEditLink: false,
      renderEditForm: true,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'parties',
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId,
      user: req.session.user,
      urn: deal.tfm.parties[partyType].partyUrn,
    });
  }
);

const getExporterPartyDetails = getPartyDetails('exporter');
const getBuyerPartyDetails = getPartyDetails('buyer');
const getAgentPartyDetails = getPartyDetails('agent');
const getIndemnifierPartyDetails = getPartyDetails('indemnifier');

const getBondIssuerPartyDetails = async (req, res) => {
  const { user } = req.session;

  const canEdit = userCanEdit(user);

  if (!canEdit) {
    return res.redirect('/not-found');
  }

  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-issuer-edit.njk', {
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
  const { user } = req.session;

  const canEdit = userCanEdit(user);

  if (!canEdit) {
    return res.redirect('/not-found');
  }

  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-beneficiary-edit.njk', {
    userCanEdit: canEdit,
    renderEditLink: false,
    renderEditForm: true,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    user,
  });
};

const postPartyDetails = (partyType) => (
  async (req, res) => {
    const { user } = req.session;
    delete req.body._csrf;

    if (!userCanEdit(user)) {
      return res.redirect('/not-found');
    }

    const dealId = req.params._id;

    const deal = await api.getDeal(dealId);

    if (!deal) {
      return res.redirect('/not-found');
    }

    /**
     * checks if partyType is exporter and if partyUrn input exists or is a blank string (nothing inputted)
     * validates input - should only be at least 3 numbers
     * validation error rendered if error exists on edit partyUrn page
     * if no error, then updates partyURN
     */
    if (req.body.partyUrn || isEmptyString(req.body.partyUrn)) {
      const urnValidationErrors = [];

      const partyUrnParams = {
        urnValue: req.body.partyUrn,
        partyUrnRequired: deal.tfm.parties[partyType].partyUrnRequired,
        // index not required for these fields as only 1 URN box on page
        index: null,
        partyType,
        urnValidationErrors,
      };

      // validates input
      const validationError = validatePartyURN(partyUrnParams);
      const canEdit = userCanEdit(user);

      if (validationError.errorsObject) {
        return res.render(`case/parties/edit/${partyType}-edit.njk`, {
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
      [partyType]: req.body,
    };

    await api.updateParty(dealId, update);

    return res.redirect(`/case/${dealId}/parties`);
  }
);

const postExporterPartyDetails = postPartyDetails('exporter');
const postBuyerPartyDetails = postPartyDetails('buyer');
const postAgentPartyDetails = postPartyDetails('agent');
const postIndemnifierPartyDetails = postPartyDetails('indemnifier');

module.exports = {
  getCaseParties,
  getExporterPartyDetails,
  getBuyerPartyDetails,
  getAgentPartyDetails,
  getIndemnifierPartyDetails,
  getBondIssuerPartyDetails,
  getBondBeneficiaryPartyDetails,
  postExporterPartyDetails,
  postBuyerPartyDetails,
  postAgentPartyDetails,
  postIndemnifierPartyDetails,
};
