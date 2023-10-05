const api = require('../../../../api');
const CONSTANTS = require('../../../../constants');
const mapAssignToSelectOptions = require('../../../../helpers/map-assign-to-select-options');
const { userIsInTeam } = require('../../../../helpers/user');
const { sortArrayOfObjectsAlphabetically } = require('../../../../helpers/array');

const getLeadUnderwriter = async (deal, user, token) => {
  let currentLeadUnderWriter;
  let currentLeadUnderWriterUserId;

  if (deal.tfm.leadUnderwriter) {
    currentLeadUnderWriterUserId = deal.tfm.leadUnderwriter;
  }

  if (currentLeadUnderWriterUserId && currentLeadUnderWriterUserId !== CONSTANTS.TASKS.UNASSIGNED) {
    currentLeadUnderWriter = await api.getUser(currentLeadUnderWriterUserId, token);
  }

  const userCanEdit = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.UNDERWRITERS]);

  return {
    userCanEdit,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user,
    currentLeadUnderWriter,
  };
};

const getAssignLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id;
  const { userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const userCanEdit = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.UNDERWRITERS]);

  if (!userCanEdit) {
    return res.redirect('/not-found');
  }

  let currentLeadUnderWriterUserId;

  if (deal.tfm.leadUnderwriter) {
    currentLeadUnderWriterUserId = deal.tfm.leadUnderwriter;
  }

  const allUnderwriterManagers = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITER_MANAGERS);
  const allUnderwriters = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITERS);

  const allTeamMembers = [...allUnderwriterManagers, ...allUnderwriters];

  const alphabeticalTeamMembers = sortArrayOfObjectsAlphabetically(allTeamMembers, 'firstName');

  return res.render('case/underwriting/lead-underwriter/assign-lead-underwriter.njk', {
    activeSubNavigation: 'underwriting',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id,
    user,
    assignToSelectOptions: mapAssignToSelectOptions(currentLeadUnderWriterUserId, user, alphabeticalTeamMembers),
  });
};

const postAssignLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id;
  const { userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const userCanEdit = userIsInTeam(user, [CONSTANTS.TEAMS.UNDERWRITER_MANAGERS, CONSTANTS.TEAMS.UNDERWRITERS]);

  if (!userCanEdit) {
    return res.redirect('/not-found');
  }

  const {
    assignedTo: assignedToValue, // will be user._id or `Unassigned`
  } = req.body;

  const update = {
    userId: assignedToValue,
  };

  await api.updateLeadUnderwriter(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getLeadUnderwriter,
  getAssignLeadUnderwriter,
  postAssignLeadUnderwriter,
};
