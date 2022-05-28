const { format, fromUnixTime } = require('date-fns');
const api = require('../../api');
const { getTask, showAmendmentButton } = require('../helpers');
const { formattedNumber } = require('../../helpers/number');
const mapAssignToSelectOptions = require('../../helpers/map-assign-to-select-options');
const CONSTANTS = require('../../constants');

const {
  DEAL,
  TASKS,
  AMENDMENTS,
  DECISIONS: { UNDERWRITER_MANAGER_DECISIONS, UNDERWRITER_MANAGER_DECISIONS_TAGS },
} = CONSTANTS;

const getCaseDeal = async (req, res) => {
  const dealId = req.params._id;

  const deal = await api.getDeal(dealId);
  const { data: amendment } = await api.getAmendmentInProgressByDealId(dealId);
  const { facilityId, type, ukefFacilityId, status } = amendment;

  if (!deal) {
    return res.redirect('/not-found');
  }

  const hasAmendmentInProgress = status === AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;

  if (hasAmendmentInProgress) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }

  return res.render('case/deal/deal.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'deal',
    dealId,
    user: req.session.user,
    facilityType: type,
    ukefFacilityId,
    facilityId,
    hasAmendmentInProgress,
  });
};

const getCaseTasks = async (req, res) => {
  const dealId = req.params._id;

  const userId = req.session.user._id;

  // default filter
  const tasksFilters = {
    filterType: TASKS.FILTER_TYPES.USER,
    userId,
  };

  const deal = await api.getDeal(dealId, tasksFilters);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/tasks/tasks.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    tasks: deal.tfm.tasks,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user: req.session.user,
    selectedTaskFilter: TASKS.FILTER_TYPES.USER,
  });
};

const filterCaseTasks = async (req, res) => {
  const dealId = req.params._id;

  const { filterType } = req.body;

  const userTeamId = req.session.user.teams[0];

  const userId = req.session.user._id;

  const tasksFilters = {
    filterType,
    teamId: userTeamId,
    userId,
  };

  const deal = await api.getDeal(dealId, tasksFilters);

  if (!deal) {
    return res.redirect('/not-found');
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
  });
};

const getCaseTask = async (req, res) => {
  const dealId = req.params._id;
  const { groupId, taskId } = req.params;
  const { user } = req.session;

  const deal = await api.getDeal(dealId);

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

  const allTeamMembers = await api.getTeamMembers(task.team.id);

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

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const {
    assignedTo: assignedToValue, // will be user._id or `Unassigned`
    status,
  } = req.body;

  const update = {
    id: taskId,
    groupId: Number(groupId),
    status,
    assignedTo: {
      userId: assignedToValue,
    },
    updatedBy: req.session.user._id,
    urlOrigin: req.headers.origin,
  };

  await api.updateTask(dealId, update);

  return res.redirect(`/case/${dealId}/tasks`);
};

const formatAmendmentDetails = (allAmendments) => {
  const allCompletedAmendments = [];
  if (allAmendments.length) {
    Object.values(allAmendments).forEach((value) => {
      // deep clone the object
      const item = { ...value };
      item.effectiveDate = value?.effectiveDate ? format(fromUnixTime(item.effectiveDate), 'dd MMMM yyyy') : null;
      item.requestDate = value?.requestDate ? format(fromUnixTime(item.requestDate), 'dd MMMM yyyy') : null;
      item.coverEndDate = value?.coverEndDate ? format(fromUnixTime(item.coverEndDate), 'dd MMMM yyyy') : null;
      item.value = value?.value ? `${value.currency} ${formattedNumber(value.value)}` : null;
      item.requireUkefApproval = value?.requireUkefApproval ? 'Yes' : 'No';
      // TODO: update once the bank's decision has been added
      item.banksDecision = value?.requireUkefApproval ? UNDERWRITER_MANAGER_DECISIONS.AWAITING_DECISION : '';
      item.tags = UNDERWRITER_MANAGER_DECISIONS_TAGS;

      if (value?.requireUkefApproval) {
        item.ukefDecisionValue = value?.ukefDecision?.value || UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED;
        item.ukefDecisionCoverEndDate = value?.ukefDecision?.coverEndDate || UNDERWRITER_MANAGER_DECISIONS.NOT_ADDED;
      } else {
        item.ukefDecisionValue = UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL;
        item.ukefDecisionCoverEndDate = UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL;
      }

      if (value?.changeCoverEndDate && value?.currentCoverEndDate) {
        item.currentCoverEndDate = format(fromUnixTime(value?.currentCoverEndDate), 'dd MMMM yyyy');
      }

      if (value?.changeFacilityValue && value?.currentValue) {
        item.currentValue = `${value.currency} ${formattedNumber(value.currentValue)}`;
      }
      allCompletedAmendments.push(item);
    });
  }
  return allCompletedAmendments;
};

const getCaseFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.getFacility(facilityId);
  const { data: amendment } = await api.getAmendmentInProgress(facilityId);
  const { status, amendmentId } = amendment;
  const { data: allAmendmentsByFacilityId } = await api.getAmendmentsByFacilityId(facilityId);

  if (!facility) {
    return res.redirect('/not-found');
  }

  const allAmendments = formatAmendmentDetails(allAmendmentsByFacilityId);

  const { dealId } = facility.facilitySnapshot;
  const deal = await api.getDeal(dealId);

  const hasAmendmentInProgress = status === AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
  const showContinueAmendmentButton = hasAmendmentInProgress && !amendment.submittedByPim && showAmendmentButton(deal, req.session.user.teams);

  if (hasAmendmentInProgress) {
    deal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
  }

  return res.render('case/facility/facility.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    facility: facility.facilitySnapshot,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'facility',
    facilityId,
    facilityTfm: facility.tfm,
    user: req.session.user,
    showAmendmentButton: showAmendmentButton(deal, req.session.user.teams) && !amendmentId,
    showContinueAmendmentButton,
    amendmentId: amendment?.amendmentId,
    amendmentVersion: amendment?.version,
    hasAmendmentInProgress,
    allAmendments,
  });
};

const postFacilityAmendment = async (req, res) => {
  const { _id: dealId, facilityId } = req.params;
  const { amendmentId } = await api.createFacilityAmendment(facilityId);

  return res.redirect(`/case/${dealId}/facility/${facilityId}/amendment/${amendmentId}/request-date`);
};

const getCaseDocuments = async (req, res) => {
  const dealId = req.params._id;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/documents/documents.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    eStoreUrl: process.env.ESTORE_URL,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'documents',
    dealId,
    user: req.session.user,
  });
};

const postTfmFacility = async (req, res) => {
  const { facilityId, ...facilityUpdateFields } = req.body;
  const dealId = req.params._id;
  delete req.body._csrf;
  delete facilityUpdateFields._csrf;

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  await Promise.all(
    facilityId.map((id, index) => {
      const facilityUpdate = {};
      Object.entries(facilityUpdateFields).forEach(([fieldName, values]) => {
        facilityUpdate[fieldName] = values[index];
      });
      return api.updateFacility(id, facilityUpdate);
    }),
  );

  /**
   * Trigger's ACBS upon bond `beneficiary`
   * and `issuer` URN criteria match.
   * */
  await api.updateParty(dealId, deal.parties);

  return res.redirect(`/case/${dealId}/parties`);
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
  postTfmFacility,
};
