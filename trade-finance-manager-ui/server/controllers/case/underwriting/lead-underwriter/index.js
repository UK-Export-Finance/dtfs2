const { TEAM_IDS } = require('@ukef/dtfs2-common');
const api = require('../../../../api');
const CONSTANTS = require('../../../../constants');
const mapAssignToSelectOptions = require('../../../../helpers/map-assign-to-select-options');
const { userIsInTeam } = require('../../../../helpers/user');
const { sortArrayOfObjectsAlphabetically } = require('../../../../helpers/array');

const getLeadUnderwriter = async (deal, user, token) => {
  let currentLeadUnderWriter;
  let currentLeadUnderWriterUserId;

  if (!deal || !user || !token) {
    console.error('Invalid arguments provided');
    return false;
  }

  if (deal?.tfm?.leadUnderwriter) {
    currentLeadUnderWriterUserId = deal.tfm.leadUnderwriter;
  }

  if (currentLeadUnderWriterUserId && currentLeadUnderWriterUserId !== CONSTANTS.TASKS.UNASSIGNED) {
    currentLeadUnderWriter = await api.getUser(currentLeadUnderWriterUserId, token);
  }

  const userCanEdit = userIsInTeam(user, [TEAM_IDS.UNDERWRITER_MANAGERS, TEAM_IDS.UNDERWRITERS]);

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

/**
 * Controller to get assign lead underwriter page
 * @async
 * @function getAssignLeadUnderwriter
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Renders assign lead underwriter page
 */
const getAssignLeadUnderwriter = async (req, res) => {
  const dealId = req.params._id;
  const { user, userToken } = req.session;
  const deal = await api.getDeal(dealId, userToken);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const userCanEdit = userIsInTeam(user, [TEAM_IDS.UNDERWRITER_MANAGERS, TEAM_IDS.UNDERWRITERS]);

  if (!userCanEdit) {
    return res.redirect('/not-found');
  }

  let currentLeadUnderWriterUserId;

  if (deal.tfm.leadUnderwriter) {
    currentLeadUnderWriterUserId = deal.tfm.leadUnderwriter;
  }

  const allUnderwriterManagers = await api.getTeamMembers(TEAM_IDS.UNDERWRITER_MANAGERS, userToken);
  const allUnderwriters = await api.getTeamMembers(TEAM_IDS.UNDERWRITERS, userToken);

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

/**
 * Controller to post lead underwriter
 * @async
 * @function postAssignLeadUnderwriter
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Redirects to the next page
 */
const postAssignLeadUnderwriter = async (req, res) => {
  const { user, userToken } = req.session;

  const userCanEdit = userIsInTeam(user, [TEAM_IDS.UNDERWRITER_MANAGERS, TEAM_IDS.UNDERWRITERS]);

  const dealId = req.params._id;
  const deal = await api.getDeal(dealId, userToken);

  if (!userCanEdit || !deal) {
    return res.redirect('/not-found');
  }

  if (!req?.body?.assignedTo) {
    console.error('Error while assigning lead underwriter to deal %s %o', dealId, req?.body);
    return res.render('_partials/problem-with-service.njk');
  }

  const update = {
    userId: req.body.assignedTo, // will be user._id or `Unassigned`
  };

  await api.updateLeadUnderwriter({ token: userToken, dealId, leadUnderwriterUpdate: update });

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getLeadUnderwriter,
  getAssignLeadUnderwriter,
  postAssignLeadUnderwriter,
};
