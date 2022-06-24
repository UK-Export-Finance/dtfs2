const api = require('../../../api');
const userCanEdit = require('./helpers');
const { hasAmendmentInProgressDealStage } = require('../../helpers/amendments.helper');
const CONSTANTS = require('../../../constants');

const { DEAL } = CONSTANTS;

const getCaseParties = async (req, res) => {
  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  if (await hasAmendmentInProgressDealStage(dealId)) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }

  const { user } = req.session;

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
