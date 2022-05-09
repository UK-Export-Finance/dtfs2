const api = require('../../api');
const { getTask, showAmendmentButton } = require('./helpers');
const mapAssignToSelectOptions = require('../../helpers/map-assign-to-select-options');
const CONSTANTS = require('../../constants');

const getCaseDeal = async (req, res) => {
  const dealId = req.params._id;

  const deal = await api.getDeal(dealId);
  const { data: amendment } = await api.getAmendmentInProgressByDealId(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/deal/deal.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'deal',
    dealId,
    user: req.session.user,
    facilityType: amendment.type,
    ukefFacilityId: amendment.ukefFacilityId,
    facilityId: amendment.amendments.facilityId,
    hasAmendmentInProgress: amendment.amendments.status === 'In progress' && amendment.amendments.requireUkefApproval,
  });
};

const getCaseTasks = async (req, res) => {
  const dealId = req.params._id;

  const userId = req.session.user._id;

  // default filter
  const tasksFilters = {
    filterType: CONSTANTS.TASKS.FILTER_TYPES.USER,
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
    selectedTaskFilter: CONSTANTS.TASKS.FILTER_TYPES.USER,
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

  const assignToSelectOptions = mapAssignToSelectOptions(
    task.assignedTo.userId,
    user,
    allTeamMembers,
  );

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

const getCaseFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.getFacility(facilityId);
  const amendment = await api.getAmendmentInProgress(facilityId);

  if (!facility) {
    return res.redirect('/not-found');
  }

  const { dealId } = facility.facilitySnapshot;
  const deal = await api.getDeal(dealId);

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
    showAmendmentButton: showAmendmentButton(deal, req.session.user.teams) && !amendment?.amendmentId,
    showContinueAmendmentButton: showAmendmentButton(deal, req.session.user.teams) && amendment?.amendmentId,
    amendmentId: amendment?.amendmentId,
    amendmentVersion: amendment.version,
    hasAmendmentInProgress: amendment.status === 'In progress' && amendment.requireUkefApproval,
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
