const { getUkefDealId } = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { userCanEdit, isEmptyString, partyType } = require('./helpers');
const validatePartyURN = require('./partyUrnValidation.validate');
const { hasAmendmentInProgressDealStage, amendmentsInProgressByDeal } = require('../../helpers/amendments.helper');
const CONSTANTS = require('../../../constants');
const { getSuccessBannerMessage } = require('../../helpers/get-success-banner-message.helper');
const { getFlashSuccessMessage } = require('../../../helpers/getFlashSuccessMessage');

const { DEAL } = CONSTANTS;

/**
 * Renders all parties URN page
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Object>} Express response, which renders all party URN page.
 */
const getAllParties = async (req, res) => {
  try {
    const dealId = req.params._id;
    const { userToken } = req.session;
    const deal = await api.getDeal(dealId, userToken);
    const { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);
    const { user } = req.session;

    if (!deal?.tfm) {
      console.error('Invalid deal.');
      return res.redirect('/not-found');
    }

    const hasAmendmentInProgress = hasAmendmentInProgressDealStage(amendments);
    if (hasAmendmentInProgress) {
      deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
    }
    const amendmentsInProgress = amendmentsInProgressByDeal(amendments);

    const canEdit = userCanEdit(user);

    const { submissionType } = deal.dealSnapshot;

    const successBannerMessage = await getSuccessBannerMessage({
      submissionType,
      userToken,
      dealId,
      ukefDealId: getUkefDealId(deal.dealSnapshot),
    });
    const flashSuccessMessage = getFlashSuccessMessage(req);

    const successMessage = successBannerMessage || flashSuccessMessage;

    // Render all parties URN page
    return res.render('case/parties/parties.njk', {
      userCanEdit: canEdit,
      renderEditLink: canEdit,
      renderEditForm: false,
      successMessage,
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'parties',
      dealId,
      user,
      hasAmendmentInProgress,
      amendmentsInProgress,
    });
  } catch (error) {
    console.error('Error rendering all parties page %o', error);
    return res.redirect('/not-found');
  }
};

/**
 * Renders party specific URN edit page
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Object>} Express response as rendered party page.
 */
const getPartyDetails = async (req, res) => {
  try {
    const { user, userToken } = req.session;
    const party = partyType(req.url);

    const canEdit = userCanEdit(user);

    if (!canEdit) {
      console.error('Invalid user privilege.');
      return res.redirect('/not-found');
    }

    const dealId = req.params._id;
    const deal = await api.getDeal(dealId, userToken);

    if (!deal?.tfm) {
      console.error('Invalid deal.');
      return res.redirect('/not-found');
    }

    if (!party) {
      console.error('Invalid party type specified.');
      return res.redirect('/not-found');
    }

    const urn = deal.tfm.parties[party] ? deal.tfm.parties[party].partyUrn : '';

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
      urn,
    });
  } catch (error) {
    console.error('Error rendering party URN edit page %o', error);
    return res.redirect('/not-found');
  }
};

/**
 * Renders party specific urn summary page
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Object>} Express response as rendered party page.
 */
const getPartyUrnDetails = async (req, res) => {
  try {
    const { user, userToken } = req.session;
    const party = partyType(req.url);

    const canEdit = userCanEdit(user);

    if (!canEdit) {
      console.error('Invalid user privilege.');
      return res.redirect('/not-found');
    }

    const dealId = req.params._id;
    const partyUrn = req.params.urn;
    const deal = await api.getDeal(dealId, userToken);

    if (!deal?.tfm) {
      console.error('Invalid deal.');
      return res.redirect('/not-found');
    }

    if (!party) {
      console.error('Invalid party type specified.');
      return res.redirect('/not-found');
    }

    if (isEmptyString(partyUrn)) {
      console.error('Invalid party urn.');
      return res.redirect('/not-found');
    }

    // Fetches company information from URN
    const company = await api.getParty(partyUrn, userToken);

    if (!company?.data || company.status !== 200) {
      return res.render('case/parties/non-existent.njk', {
        dealId,
        party,
        urn: partyUrn,
      });
    }

    const name = company?.data?.length ? company?.data[0]?.name : '';

    return res.render('case/parties/summary/party.njk', {
      userCanEdit: canEdit,
      renderEditLink: false,
      renderEditForm: true,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'parties',
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId,
      user: req.session.user,
      urn: partyUrn,
      name,
      party,
    });
  } catch (error) {
    console.error('Error rendering party specific urn summary page %o', error);
    return res.redirect('/not-found');
  }
};

/**
 * Renders bond specific urn summary page
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Object>} Express response as rendered party page.
 */
const getBondUrnDetails = async (req, res) => {
  try {
    const { user, userToken } = req.session;
    const party = partyType(req.url);

    const canEdit = userCanEdit(user);

    if (!canEdit) {
      console.error('Invalid user privilege.');
      return res.redirect('/not-found');
    }

    const dealId = req.params._id;
    const partyUrns = req.session.urn;

    const deal = await api.getDeal(dealId, userToken);

    if (!deal?.tfm) {
      console.error('Invalid deal.');
      return res.redirect('/not-found');
    }

    if (!party) {
      console.error('Invalid party type specified.');
      return res.redirect('/not-found');
    }

    const companies = partyUrns.map((urn) =>
      api
        .getParty(urn, userToken)
        // Non-existent party urn
        .then((company) => (!company?.data?.length ? Promise.resolve() : Promise.resolve(company.data[0].name))),
    );

    const name = await Promise.all(companies);

    return res.render('case/parties/summary/bond.njk', {
      userCanEdit: canEdit,
      renderEditLink: false,
      renderEditForm: true,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'parties',
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId,
      user: req.session.user,
      urn: partyUrns,
      name,
      party,
    });
  } catch (error) {
    console.error('Error rendering bond specific urn summary page %o', error);
    return res.redirect('/not-found');
  }
};

/**
 * Post party URN to the summary page for confirmation
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Object>} Express response as rendered confirm party URN page.
 */
const confirmPartyUrn = async (req, res) => {
  try {
    const party = partyType(req.url);
    const { user, userToken } = req.session;

    const canEdit = userCanEdit(user);

    if (!canEdit) {
      console.error('Invalid user privilege.');
      return res.redirect('/not-found');
    }

    const dealId = req.params._id;
    const deal = await api.getDeal(dealId, userToken);

    if (!deal?.tfm) {
      console.error('Invalid deal.');
      return res.redirect('/not-found');
    }

    if (!party) {
      console.error('Invalid party type specified.');
      return res.redirect('/not-found');
    }

    /**
     * PartyURN input validation.
     * 1. Should be at least 3 numbers
     */
    const { partyUrn } = req.body;

    /**
     * Check `partyUrn` is minimum 3 digits
     * and is not empty.
     */
    if (partyUrn || isEmptyString(partyUrn)) {
      const urnValidationErrors = [];

      const partyUrnParams = {
        urnValue: partyUrn,
        partyUrnRequired: deal.tfm.parties[party].partyUrnRequired,
        // index not required for these fields as only 1 URN box on page
        index: null,
        party,
        urnValidationErrors,
      };

      // Validates partyURN input
      const validationError = validatePartyURN(partyUrnParams);

      if (validationError.errorsObject) {
        // Render party specific page with error
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
          errors: validationError.errorsObject.errors,
          urn: validationError.urn,
        });
      }
    }

    // Fetches company information from URN
    const company = await api.getParty(partyUrn, userToken);

    // Non-existent party urn
    if (!company?.data || company.status !== 200) {
      return res.render('case/parties/non-existent.njk', {
        dealId,
        party,
        urn: partyUrn,
      });
    }

    // Agent party only - Commission rate
    if (req.body.commissionRate) {
      req.session.commissionRate = req.body.commissionRate;
    }

    // Redirect to summary (confirmation) page
    return res.redirect(`/case/${dealId}/parties/${party}/summary/${partyUrn}`);
  } catch (error) {
    console.error('Error posting party URN %o', error);
    return res.redirect('/not-found');
  }
};

/**
 * Submits confirmed party URN to the TFM
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<Object>} Express response, if successful then re-directed to all parties page
 */
const postPartyDetails = async (req, res) => {
  try {
    const { user, userToken } = req.session;

    delete req.body._csrf;

    if (!userCanEdit(user)) {
      return res.redirect('/not-found');
    }

    const dealId = req.params._id;
    const deal = await api.getDeal(dealId, userToken);

    if (!deal?.tfm) {
      console.error('Invalid deal.');
      return res.redirect('/not-found');
    }

    const party = partyType(req.url);

    if (!party) {
      console.error('Invalid party type specified.');
      return res.redirect('/not-found');
    }

    const partyUrn = req.params.urn;

    if (isEmptyString(partyUrn)) {
      console.error('Invalid party urn.');
      return res.redirect('/not-found');
    }

    // Party URN
    const update = {
      [party]: {
        partyUrn,
      },
    };

    // Agent party only - Commission rate
    if (req.session.commissionRate) {
      update[party].commissionRate = req.session.commissionRate;
      delete req.session.commissionRate;
    }

    await api.updateParty(dealId, update, userToken);

    return res.redirect(`/case/${dealId}/parties`);
  } catch (error) {
    console.error('Error posting party URN to TFM %o', error);
    return res.redirect('/not-found');
  }
};

module.exports = {
  getPartyDetails,
  getPartyUrnDetails,
  getBondUrnDetails,
  confirmPartyUrn,
  postPartyDetails,
  getAllParties,
};
