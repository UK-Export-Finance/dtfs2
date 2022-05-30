const api = require('../../../api');
const CONSTANTS = require('../../../constants');

const mapAssignToSelectOptions = require('../../../helpers/map-assign-to-select-options');
const { userCanEditLeadUnderwriter } = require('../../helpers');
const { sortArrayOfObjectsAlphabetically } = require('../../../helpers/array');

/**
 * @param {Object} amendment
 * @param {Object} user
 * @returns {Object}
 * checks if leadUnderwriter already set and returns an object with currentLeadUnderwriter if set
 */
const getAmendmentLeadUnderwriter = async (amendment, user) => {
  let leadUnderwriter;
  let leadUnderwriterId;

  // checks if leadUnderwriter exists in amendments object and sets currentLeadUnderWriterUserId
  if (amendment?.leadUnderwriterId) {
    leadUnderwriterId = amendment.leadUnderwriterId;
  }

  // checks if set and not unassigned and gets details
  if (leadUnderwriterId && leadUnderwriterId !== CONSTANTS.TASKS.UNASSIGNED) {
    leadUnderwriter = await api.getUser(leadUnderwriterId);
  }

  // checks if user has ability to assign or change lead-underwriter to render change link or add button
  const isEditable = userCanEditLeadUnderwriter(user);

  return {
    isEditable,
    leadUnderwriter,
  };
};

/**
 * @param {*} req
 * @param {*} res
 * gets deal and amendment by id
 * checks if user can edit
 * gets all underwriter/ managers and populates dropdown list
 * renders template
 */
const getAssignAmendmentLeadUnderwriter = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId || status !== 200) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  // checks if can edit
  const isEditable = userCanEditLeadUnderwriter(user);

  let currentLeadUnderWriterUserId;
  // if already set then shows name of assigned underwriter
  if (amendment.leadUnderwriterId) {
    currentLeadUnderWriterUserId = amendment.leadUnderwriterId;
  }

  // gets all underwriter and managers
  const allUnderwriterManagers = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITER_MANAGERS);
  const allUnderwriters = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITERS);
  const allTeamMembers = [...allUnderwriterManagers, ...allUnderwriters];

  // sorts alphabetically
  const alphabeticalTeamMembers = sortArrayOfObjectsAlphabetically(allTeamMembers, 'firstName');
  const assignToSelectOptions = mapAssignToSelectOptions(currentLeadUnderWriterUserId, user, alphabeticalTeamMembers);

  return res.render('case/amendments/amendment-assign-lead-underwriter.njk', {
    assignToSelectOptions,
    amendment,
    dealId,
    isEditable,
    user,
  });
};

/**
 * @param {*} req
 * @param {*} res
 * checks if unassigned or assigned to user
 * if unassigned then does not make getUser api call
 * redirects back to underwriting page
 */
const postAssignAmendmentLeadUnderwriter = async (req, res) => {
  const { _id: dealId, amendmentId, facilityId } = req.params;
  const { data: amendment, status } = await api.getAmendmentById(facilityId, amendmentId);

  if (!amendment?.amendmentId || status !== 200) {
    return res.redirect('/not-found');
  }

  const { assignedTo: assignedToValue } = req.body;
  const update = { leadUnderwriterId: assignedToValue };

  await api.updateAmendment(facilityId, amendmentId, update);

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getAmendmentLeadUnderwriter,
  getAssignAmendmentLeadUnderwriter,
  postAssignAmendmentLeadUnderwriter,
};
