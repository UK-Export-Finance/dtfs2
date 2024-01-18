const _ = require('lodash');
const MANDATORY_CRITERIA = require('../mandatoryCriteria');

const getLatestMandatoryCriteria = () =>
  _.cloneDeep(
    MANDATORY_CRITERIA.reduce(
      (latestCriteria, currentCriteria) =>
        (latestCriteria.version > currentCriteria.version
          ? latestCriteria
          : currentCriteria
        ),
      MANDATORY_CRITERIA[0].version,
    ),
  );

module.exports = {
  getLatestMandatoryCriteria,
};
