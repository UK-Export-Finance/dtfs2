const api = require('../../../../../api');
const CONSTANTS = require('../../../../../constants');

const mapAssignToSelectOptions = require('../../../../../helpers/map-assign-to-select-options');
const { canUserEditLeadUnderwriter } = require('../helpers');
const { sortArrayOfObjectsAlphabetically } = require('../../../../../helpers/array');

/**
 * @param {Object} deal
 * @param {Object} amendment
 * @param {Object} user
 * @returns {Object}
 * checks if leadUnderwriter already set and returns an object with currentLeadUnderwriter if set
 */
const getAmendmentLeadUnderwriter = async (amendment, user) => {
  let currentLeadUnderWriter;
  let currentLeadUnderWriterUserId;

  // checks if leadUnderwriter exists in amendments object and sets currentLeadUnderWriterUserId
  if (amendment?.leadUnderwriter?.userId) {
    currentLeadUnderWriterUserId = amendment.leadUnderwriter.userId;
  }

  // checks if set and not unassigned and gets details
  if (currentLeadUnderWriterUserId && currentLeadUnderWriterUserId !== CONSTANTS.TASKS.UNASSIGNED) {
    currentLeadUnderWriter = await api.getUser(currentLeadUnderWriterUserId);
  }

  // checks if user has ability to assign or change lead-underwriter to render change link or add button
  const isEditable = canUserEditLeadUnderwriter(user);

  return {
    isEditable,
    currentLeadUnderWriter,
    dealId: amendment.dealId,
    facilityId: amendment.facilityId,
    amendmentId: amendment.amendmentId,
    amendment,
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
  const deal = await api.getDeal(dealId);

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  // if no amendment or deal
  if ((!amendment || !amendment.amendmentId) || !deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  // checks if can edit
  const isEditable = canUserEditLeadUnderwriter(user);

  let currentLeadUnderWriterUserId;

  // if already set then shows name of assigned underwriter
  if (amendment.leadUnderwriter) {
    currentLeadUnderWriterUserId = amendment.leadUnderwriter.userId;
  }

  // gets all underwriter and managers
  const allUnderwriterManagers = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITER_MANAGERS);
  const allUnderwriters = await api.getTeamMembers(CONSTANTS.TEAMS.UNDERWRITERS);

  const allTeamMembers = [
    ...allUnderwriterManagers,
    ...allUnderwriters,
  ];

  // sorts alphabetically
  const alphabeticalTeamMembers = sortArrayOfObjectsAlphabetically(allTeamMembers, 'firstName');

  return res.render('case/amendments/underwriting/amendment-lead-underwriter/amendment-assign-lead-underwriter.njk', {
    assignToSelectOptions: mapAssignToSelectOptions(currentLeadUnderWriterUserId, user, alphabeticalTeamMembers),
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
  const deal = await api.getDeal(dealId);

  const { data: amendment } = await api.getAmendmentById(facilityId, amendmentId);

  if ((!amendment || !amendment.amendmentId) || !deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  const isEditable = canUserEditLeadUnderwriter(user);

  if (!isEditable) {
    return res.redirect('/not-found');
  }

  const {
    assignedTo: assignedToValue, // will be user._id or `Unassigned`
  } = req.body;

  if (assignedToValue === 'Unassigned') {
    const update = {
      leadUnderwriter: {
        userId: assignedToValue,
      },
    };

    await api.updateAmendment(facilityId, amendmentId, update);

    return res.redirect(`/case/${dealId}/underwriting`);
  }

  const update = {
    leadUnderwriter: {
      userId: assignedToValue,
    },
  };

  await api.updateAmendment(facilityId, amendmentId, update);

  return res.redirect(`/case/${dealId}/underwriting`);
};

module.exports = {
  getAmendmentLeadUnderwriter,
  getAssignAmendmentLeadUnderwriter,
  postAssignAmendmentLeadUnderwriter,
};
