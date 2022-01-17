const {
  DEAL_STATUS,
  AUTHORISATION_LEVEL,
} = require('../constants');

const statesWhereMakerHasEditAccess = [
  DEAL_STATUS.DRAFT,
  DEAL_STATUS.NOT_STARTED,
  DEAL_STATUS.IN_PROGRESS,
  DEAL_STATUS.CHANGES_REQUIRED,
];
const statesWhereMakerHasReadAccess = [DEAL_STATUS.READY_FOR_APPROVAL];
const statesWhereMakerHasCommentAccess = [DEAL_STATUS.READY_FOR_APPROVAL];
const statesWhereCheckerHasEditAccess = [];
const statesWhereCheckerHasReadAccess = [DEAL_STATUS.READY_FOR_APPROVAL];
const statesWhereCheckerHasCommentAccess = [DEAL_STATUS.READY_FOR_APPROVAL];

const authorisationMap = {
  MAKER: {},
  CHECKER: {},
};

Object.values(DEAL_STATUS).forEach((state) => {
  authorisationMap.MAKER[state] = [];
  authorisationMap.CHECKER[state] = [];
});

statesWhereMakerHasReadAccess.forEach((state) => {
  authorisationMap.MAKER[state].push(AUTHORISATION_LEVEL.READ);
});
statesWhereMakerHasEditAccess.forEach((state) => {
  authorisationMap.MAKER[state].push(AUTHORISATION_LEVEL.EDIT);
});
statesWhereMakerHasCommentAccess.forEach((state) => {
  authorisationMap.MAKER[state].push(AUTHORISATION_LEVEL.COMMENT);
});
statesWhereCheckerHasReadAccess.forEach((state) => {
  authorisationMap.CHECKER[state].push(AUTHORISATION_LEVEL.READ);
});
statesWhereCheckerHasEditAccess.forEach((state) => {
  authorisationMap.CHECKER[state].push(AUTHORISATION_LEVEL.EDIT);
});
statesWhereCheckerHasCommentAccess.forEach((state) => {
  authorisationMap.CHECKER[state].push(AUTHORISATION_LEVEL.COMMENT);
});

const getUserAuthorisationLevelsToApplication = (user, application) => {
  const { roles } = user;

  try {
    let levels = [];
    roles.forEach((role) => {
      levels = levels.concat(authorisationMap[role.toUpperCase()][application.status]);
    });
    const unique = new Set(levels);
    return [...unique];
  } catch (e) {
    console.error('Authorisation error', { e });
  }

  return [];
};

module.exports = getUserAuthorisationLevelsToApplication;
