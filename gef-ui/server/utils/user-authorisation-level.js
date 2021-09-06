const { PROGRESS, AUTHORISATION_LEVEL } = require('../../constants');

const statesWhereMakerHasEditAccess = [
  PROGRESS.DRAFT,
  PROGRESS.NOT_STARTED,
  PROGRESS.IN_PROGRESS,
  PROGRESS.CHANGES_REQUIRED,
];
const statesWhereMakerHasReadAccess = [PROGRESS.BANK_CHECK];
const statesWhereMakerHasCommentAccess = [PROGRESS.BANK_CHECK];
const statesWhereCheckerHasEditAccess = [];
const statesWhereCheckerHasReadAccess = [PROGRESS.BANK_CHECK];
const statesWhereCheckerHasCommentAccess = [PROGRESS.BANK_CHECK];

const authorisationMap = {
  MAKER: {},
  CHECKER: {},
};
Object.values(PROGRESS).forEach((state) => {
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
  const applicationState = application.status.toUpperCase();

  try {
    let levels = [];
    roles.forEach((role) => {
      levels = levels.concat(authorisationMap[role.toUpperCase()][applicationState]);
    });
    const unique = new Set(levels);
    return [...unique];
  } catch (e) {
    // logger.error(e, 'Authorisation error: ');
  }

  return [];
};

module.exports = getUserAuthorisationLevelsToApplication;
