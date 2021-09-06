import api from '../../api';
import { getTask } from './helpers';
import mapAssignToSelectOptions from '../../helpers/map-assign-to-select-options';
import CONSTANTS from '../../constants';

const getCaseDeal = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const deal = await api.getDeal(dealId);

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
  });
};

const getCaseTasks = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const userId = req.session.user._id; // eslint-disable-line no-underscore-dangle

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
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const { filterType } = req.body;

  const userTeamId = req.session.user.teams[0];

  const userId = req.session.user._id; // eslint-disable-line no-underscore-dangle

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
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
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
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

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
    updatedBy: req.session.user._id, // eslint-disable-line no-underscore-dangle
    urlOrigin: req.headers.origin,
  };

  await api.updateTask(dealId, update);

  return res.redirect(`/case/${dealId}/tasks`);
};

const getCaseFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.getFacility(facilityId);

  if (!facility) {
    return res.redirect('/not-found');
  }

  const { associatedDealId } = facility.facilitySnapshot;
  const deal = await api.getDeal(associatedDealId);

  return res.render('case/facility/facility.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    facility: facility.facilitySnapshot,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'facility',
    facilityId,
    facilityTfm: facility.tfm,
    user: req.session.user,
  });
};


const getCaseDocuments = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
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
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

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

  return res.redirect(`/case/${dealId}/parties`);
};

export default {
  getCaseDeal,
  getCaseTasks,
  filterCaseTasks,
  getCaseTask,
  putCaseTask,
  getCaseFacility,
  getCaseDocuments,
  postTfmFacility,
};
