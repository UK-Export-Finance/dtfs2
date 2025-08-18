const { format, fromUnixTime } = require('date-fns');
const {
  MONGO_DB_COLLECTIONS,
  FLASH_TYPES,
  formattedNumber,
  convertUnixTimestampWithoutMilliseconds,
  PORTAL_AMENDMENT_STATUS,
  DATE_FORMATS,
} = require('@ukef/dtfs2-common');
const api = require('../../api');
const {
  getTask,
  showAmendmentButton,
  ukefDecisionRejected,
  isDealCancellationEnabledForUser,
  canDealBeCancelled,
  isDealCancellationInDraft,
} = require('../helpers');
const mapAssignToSelectOptions = require('../../helpers/map-assign-to-select-options');
const CONSTANTS = require('../../constants');
const { filterTasks } = require('../helpers/tasks.helper');
const { getAmendmentsInProgressSubmittedFromPim, getAmendmentsInProgress, generatePortalAmendmentEligibilityRows } = require('../helpers/amendments.helper');
const validatePartyURN = require('./parties/partyUrnValidation.validate');
const { bondType, partyType, userCanEdit } = require('./parties/helpers');
const { asUserSession } = require('../../helpers/express-session');
const { getDealSuccessBannerMessage } = require('../helpers/get-success-banner-message.helper');

const {
  DEAL,
  TASKS,
  AMENDMENTS,
  DECISIONS: { UNDERWRITER_MANAGER_DECISIONS, UNDERWRITER_MANAGER_DECISIONS_TAGS },
} = CONSTANTS;

const getCaseDeal = async (req, res) => {
  try {
    const dealId = req.params._id;
    const { userToken } = req.session;

    const { user } = asUserSession(req.session);

    const deal = await api.getDeal(dealId, userToken);
    const { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);

    if (!deal) {
      return res.redirect('/not-found');
    }

    if (!amendments || !Array.isArray(amendments)) {
      console.error('Unable to get amendments for deal id %s', dealId);
      return res.redirect('/not-found');
    }

    const amendmentsInProgressSubmittedFromPim = getAmendmentsInProgressSubmittedFromPim({ amendments, deal });
    const hasAmendmentInProgressSubmittedFromPim = amendmentsInProgressSubmittedFromPim.length > 0;

    if (hasAmendmentInProgressSubmittedFromPim) {
      deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
    }

    const { dealSnapshot } = deal;

    const dealCancellationIsEnabled = isDealCancellationEnabledForUser(dealSnapshot.submissionType, user);

    let showDealCancelButton = false;
    let hasDraftCancellation = false;

    if (dealCancellationIsEnabled) {
      const cancellation = await api.getDealCancellation(dealId, userToken);
      showDealCancelButton = canDealBeCancelled(cancellation.status);
      hasDraftCancellation = isDealCancellationInDraft(cancellation.status);
    }

    const successMessage = await getDealSuccessBannerMessage({
      dealSnapshot,
      userToken,
      flashedSuccessMessage: req.flash(FLASH_TYPES.SUCCESS_MESSAGE)[0],
    });

    return res.render('case/deal/deal.njk', {
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      successMessage,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: MONGO_DB_COLLECTIONS.DEALS,
      dealId,
      user: req.session.user,
      amendments,
      amendmentsInProgressSubmittedFromPim,
      hasAmendmentInProgressSubmittedFromPim,
      showDealCancelButton,
      hasDraftCancellation,
    });
  } catch (error) {
    console.error('Unable to render deal %o', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

const getCaseTasks = async (req, res) => {
  const dealId = req.params._id;
  const { userToken } = req.session;
  const userId = req.session.user._id;

  // default filter
  const tasksFilters = {
    filterType: TASKS.FILTER_TYPES.ALL,
    userId,
  };

  const deal = await api.getDeal(dealId, userToken, tasksFilters);
  const { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);
  if (!deal) {
    return res.redirect('/not-found');
  }

  const amendmentsInProgressSubmittedFromPim = getAmendmentsInProgressSubmittedFromPim({ amendments, deal });
  const hasAmendmentInProgressSubmittedFromPim = amendmentsInProgressSubmittedFromPim.length > 0;

  if (hasAmendmentInProgressSubmittedFromPim) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }

  if (Array.isArray(amendments) && amendments.length > 0) {
    amendments.map((a) => {
      const amendment = a;
      amendment.tasks = filterTasks(amendment.tasks, tasksFilters);
      return amendment;
    });
  }

  const { dealSnapshot } = deal;

  const successMessage = await getDealSuccessBannerMessage({
    dealSnapshot,
    userToken,
    flashedSuccessMessage: req.flash(FLASH_TYPES.SUCCESS_MESSAGE)[0],
  });

  return res.render('case/tasks/tasks.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    tasks: deal.tfm.tasks,
    successMessage,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user: req.session.user,
    selectedTaskFilter: tasksFilters.filterType,
    amendments,
    hasAmendmentInProgressSubmittedFromPim,
    amendmentsInProgressSubmittedFromPim,
  });
};

const filterCaseTasks = async (req, res) => {
  const dealId = req.params._id;
  const { userToken } = req.session;
  const { filterType } = req.body;

  const userTeamId = req.session.user.teams[0];

  const userId = req.session.user._id;

  const tasksFilters = {
    filterType,
    teamId: userTeamId,
    userId,
  };

  const deal = await api.getDeal(dealId, userToken, tasksFilters);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);
  if (!deal) {
    return res.redirect('/not-found');
  }

  const amendmentsInProgressSubmittedFromPim = getAmendmentsInProgressSubmittedFromPim({ amendments, deal });
  const hasAmendmentInProgressSubmittedFromPim = amendmentsInProgressSubmittedFromPim.length > 0;

  if (hasAmendmentInProgressSubmittedFromPim) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }

  if (Array.isArray(amendments) && amendments.length > 0) {
    amendments.map((a) => {
      const amendment = a;
      amendment.tasks = filterTasks(amendment.tasks, tasksFilters);
      return amendment;
    });
  }

  return res.render('case/tasks/tasks.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    tasks: deal.tfm.tasks,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user: req.session.user,
    selectedTaskFilter: filterType,
    amendments,
    hasAmendmentInProgressSubmittedFromPim,
    amendmentsInProgressSubmittedFromPim,
  });
};

const getCaseTask = async (req, res) => {
  const dealId = req.params._id;
  const { groupId, taskId } = req.params;
  const { user, userToken } = req.session;

  const deal = await api.getDeal(dealId, userToken);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const task = getTask(Number(groupId), taskId, deal.tfm.tasks);

  if (!task) {
    return res.redirect('/not-found');
  }

  if (!task.canEdit) {
    return res.redirect(`/case/${dealId}/tasks`);
  }

  const allTeamMembers = await api.getTeamMembers(task.team.id, userToken);

  const assignToSelectOptions = mapAssignToSelectOptions(task.assignedTo.userId, user, allTeamMembers);

  return res.render('case/tasks/task.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user,
    task,
    assignToSelectOptions,
  });
};

const putCaseTask = async (req, res) => {
  const dealId = req.params._id;

  const { groupId, taskId } = req.params;
  const { userToken } = req.session;

  const deal = await api.getDeal(dealId, userToken);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const {
    assignedTo: assignedToValue, // will be user._id or `Unassigned`
    status,
  } = req.body;

  const update = {
    status,
    assignedTo: {
      userId: assignedToValue,
    },
    updatedBy: req.session.user._id,
    urlOrigin: req.headers.origin,
  };

  await api.updateTask(dealId, groupId, taskId, update, userToken);

  return res.redirect(`/case/${dealId}/tasks`);
};

const formatCompletedAmendmentDetails = (allAmendments) => {
  const allCompletedAmendments = [];
  if (allAmendments.length) {
    Object.values(allAmendments).forEach((amendment) => {
      if (amendment.submittedByPim === true || amendment.status === PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED) {
        // deep clone the object
        const item = { ...amendment };
        item.requestDate = amendment?.requestDate ? format(fromUnixTime(item.requestDate), DATE_FORMATS.DD_MMMM_YYYY) : null;

        item.name = `Amendment ${amendment.referenceNumber}`;

        const formattedCoverEndDate = amendment?.coverEndDate ? convertUnixTimestampWithoutMilliseconds(amendment.coverEndDate) : null;

        item.coverEndDate = formattedCoverEndDate ? format(fromUnixTime(formattedCoverEndDate), DATE_FORMATS.DD_MMMM_YYYY) : null;

        item.value = amendment?.value ? `${amendment.currency} ${formattedNumber(amendment.value)}` : null;
        item.requireUkefApproval = amendment?.requireUkefApproval ? 'Yes' : 'No';
        // if bankDecision submitted, then adds decision, else adds awaiting decision (locally)
        item.banksDecision = amendment?.bankDecision?.submitted ? amendment?.bankDecision?.decision : AMENDMENTS.AMENDMENT_BANK_DECISION.AWAITING_DECISION;
        // checks if coverEndDate/facility value or both on an amendment request are declined
        if (amendment?.ukefDecision?.submitted) {
          if (ukefDecisionRejected(amendment)) {
            // sets bank decision to not applicable locally
            item.banksDecision = AMENDMENTS.AMENDMENT_BANK_DECISION.NOT_APPLICABLE;
          }

          const date = format(fromUnixTime(amendment.ukefDecision.submittedAt), DATE_FORMATS.DD_MMMM_YYYY);
          const time = format(fromUnixTime(amendment.ukefDecision.submittedAt), 'h:mm aaa');
          item.ukefDecision.submittedAt = `${date} at ${time}`;
        }

        item.tags = UNDERWRITER_MANAGER_DECISIONS_TAGS;
        item.bankDecisionTags = AMENDMENTS.BANK_DECISIONS_TAGS;

        if (amendment?.requireUkefApproval) {
          item.ukefDecisionValue = amendment?.ukefDecision?.submitted ? amendment?.ukefDecision?.value : UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED;

          item.ukefDecisionCoverEndDate = amendment?.ukefDecision?.submitted ? amendment?.ukefDecision?.coverEndDate : UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED;

          item.effectiveDate = amendment?.bankDecision?.effectiveDate ? format(fromUnixTime(item.bankDecision.effectiveDate), DATE_FORMATS.DD_MMMM_YYYY) : null;
        } else {
          item.ukefDecisionValue = UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL;

          item.ukefDecisionCoverEndDate = UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL;

          item.effectiveDate = amendment?.effectiveDate ? format(fromUnixTime(item.effectiveDate), DATE_FORMATS.DD_MMMM_YYYY) : null;
        }

        if (amendment?.changeCoverEndDate && amendment?.currentCoverEndDate) {
          item.currentCoverEndDate = format(fromUnixTime(amendment?.currentCoverEndDate), DATE_FORMATS.DD_MMMM_YYYY);
        }

        if (amendment?.changeFacilityValue && amendment?.currentValue) {
          item.currentValue = `${amendment.currency} ${formattedNumber(amendment.currentValue)}`;
        }

        allCompletedAmendments.push(item);
      }
    });
  }
  return allCompletedAmendments;
};

const getCaseFacility = async (req, res) => {
  try {
    const { _id: dealId, facilityId } = req.params;
    const { userToken } = req.session;
    const facility = await api.getFacility(facilityId, userToken);
    const { data: amendment } = await api.getAmendmentInProgress(facilityId, userToken);
    const { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);
    const { data: allAmendmentsByFacilityId } = await api.getAmendmentsByFacilityId(facilityId, userToken);

    if (!facility) {
      return res.redirect('/not-found');
    }

    const allAmendments = formatCompletedAmendmentDetails(allAmendmentsByFacilityId);

    const deal = await api.getDeal(dealId, userToken);

    /**
     * Ensure imperative deal properties exist before rendering
     */
    if (!deal?.dealSnapshot?._id || !deal?.tfm) {
      console.error('An error occurred while rendering a TFM deal %s', dealId);
      return res.render('_partials/problem-with-service.njk');
    }

    const amendmentsInProgressSubmittedFromPim = getAmendmentsInProgressSubmittedFromPim({ amendments, deal });
    const hasAmendmentInProgressSubmittedFromPim = amendmentsInProgressSubmittedFromPim.length > 0;

    const { hasAmendmentInProgress, hasAmendmentInProgressButton, showContinueAmendmentButton } = getAmendmentsInProgress({
      amendments,
      deal,
      teams: req.session.user.teams,
    });

    if (hasAmendmentInProgressSubmittedFromPim) {
      deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
    }

    const allAmendmentsWithEligibility = generatePortalAmendmentEligibilityRows(allAmendments);

    return res.render('case/facility/facility.njk', {
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId: deal.dealSnapshot._id,
      facility: facility.facilitySnapshot,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: MONGO_DB_COLLECTIONS.FACILITIES,
      facilityId,
      facilityTfm: facility.tfm,
      user: req.session.user,
      showAmendmentButton: showAmendmentButton(deal, req.session.user.teams) && !hasAmendmentInProgress && !amendment.amendmentId,
      showContinueAmendmentButton,
      amendmentId: amendment?.amendmentId,
      amendmentVersion: amendment?.version,
      hasAmendmentInProgressSubmittedFromPim,
      hasAmendmentInProgressButton,
      allAmendments: allAmendmentsWithEligibility,
      amendments,
      amendmentsInProgressSubmittedFromPim,
      showFacilityEndDate: facility.facilitySnapshot.isGef,
    });
  } catch (error) {
    console.error('Error getting case facility %o', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

const postFacilityAmendment = async (req, res) => {
  const { _id: dealId, facilityId } = req.params;
  const { userToken } = req.session;
  const { amendmentId } = await api.createFacilityAmendment(facilityId, userToken);

  return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-date`);
};

const getCaseDocuments = async (req, res) => {
  try {
    const dealId = req.params._id;
    const { userToken } = req.session;
    const deal = await api.getDeal(dealId, userToken);
    const { data: amendments } = await api.getAmendmentsByDealId(dealId, userToken);

    if (!deal) {
      return res.redirect('/not-found');
    }

    const amendmentsInProgressSubmittedFromPim = getAmendmentsInProgressSubmittedFromPim({ amendments, deal });
    const hasAmendmentInProgressSubmittedFromPim = amendmentsInProgressSubmittedFromPim.length > 0;

    if (hasAmendmentInProgressSubmittedFromPim) {
      deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
    }

    const { dealSnapshot } = deal;

    const successMessage = await getDealSuccessBannerMessage({
      dealSnapshot,
      userToken,
      flashedSuccessMessage: req.flash(FLASH_TYPES.SUCCESS_MESSAGE)[0],
    });

    return res.render('case/documents/documents.njk', {
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      successMessage,
      eStoreUrl: process.env.ESTORE_URL,
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'documents',
      dealId,
      user: req.session.user,
      hasAmendmentInProgressSubmittedFromPim,
      amendmentsInProgressSubmittedFromPim,
    });
  } catch (error) {
    console.error('Error getCaseDocuments %o', error);
    return res.redirect('/not-found');
  }
};

/**
 * Post party URNs to bond summary page for confirmation
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<object>} Express response as rendered confirm party URN page.
 */
const confirmTfmFacility = async (req, res) => {
  try {
    const { facilityId } = req.body;
    delete req.body._csrf;

    const party = partyType(req.url);
    const bond = bondType(party);
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
     * Check `partyUrn` is minimum 3 digits
     * and is not empty.
     */
    if (req.body[bond]?.length) {
      const urnValidationErrors = [];
      let validationErrors = {};

      // loops through array of URNs
      req.body[bond].forEach((urn, index) => {
        // constructs object for validation
        const partyUrnParams = {
          urnValue: urn,
          // partyURN not required for these fields
          partyUrnRequired: null,
          // adds 1 to index as nunjucks indexes start at 1
          index: index + 1,
          party,
          urnValidationErrors,
        };

        // Validates partyURN input
        const errors = validatePartyURN(partyUrnParams);

        // if errors, then overrides validationErrors object
        if (errors.errorsObject) {
          validationErrors = errors;
        }
      });

      if (validationErrors.errorsObject) {
        // Render bond specific page with error
        return res.render(`case/parties/edit/${party}.njk`, {
          userCanEdit: canEdit,
          renderEditLink: false,
          renderEditForm: true,
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'parties',
          deal: deal.dealSnapshot,
          user,
          errors: validationErrors.errorsObject.errors,
          urn: req.body[bond],
        });
      }
    }

    // Fetches company information from URN
    const companies = req.body[bond].map((urn) =>
      api
        .getParty(urn, userToken)
        // Non-existent party urn
        .then((company) => (!company?.data || company?.status !== 200 ? Promise.resolve(false) : Promise.resolve(true))),
    );

    const responses = await Promise.all(companies);
    let invalidUrn = 0;
    const validUrn = responses.every((response, index) => {
      if (!response) {
        invalidUrn = index;
        return false;
      }

      return true;
    });

    // Re-direct if any party urn is invalid
    if (!validUrn) {
      return res.render('case/parties/non-existent.njk', {
        dealId,
        party,
        urn: req.body[bond][invalidUrn],
      });
    }

    // Redirect to summary (confirmation) page
    req.session.urn = req.body[bond];
    req.session.facilityId = facilityId;

    return res.redirect(`/case/${dealId}/parties/${party}/summary`);
  } catch (error) {
    console.error('Error posting bond party URN %o', error);
    return res.redirect('/not-found');
  }
};

/**
 * Post bond party URNs to the TFM
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Promise<object>} Express response as rendered confirm party URN page.
 */
const postTfmFacility = async (req, res) => {
  try {
    delete req.body._csrf;

    const { user, urn, facilityId, userToken } = req.session;

    const party = partyType(req.url);
    const bond = bondType(party);

    delete req.session.urn;
    delete req.session.facilityId;

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

    // Update facilities
    await Promise.all(
      facilityId.map((id, index) => {
        const update = {
          [bond]: urn[index],
        };
        return api.updateFacility(id, update, userToken);
      }),
    );

    /**
     * Trigger's ACBS upon bond `beneficiary`
     * and `issuer` URN criteria match.
     * */
    await api.updateParty(dealId, deal.tfm.parties, userToken);

    return res.redirect(`/case/${dealId}/parties`);
  } catch (error) {
    console.error('Error posting bond party URN to TFM %o', error);
    return res.redirect('/not-found');
  }
};

module.exports = {
  getCaseDeal,
  getCaseTasks,
  filterCaseTasks,
  getCaseTask,
  putCaseTask,
  getCaseFacility,
  postFacilityAmendment,
  getCaseDocuments,
  confirmTfmFacility,
  postTfmFacility,
};
