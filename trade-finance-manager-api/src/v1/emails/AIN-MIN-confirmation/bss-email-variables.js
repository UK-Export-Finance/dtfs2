const CONSTANTS = require('../../../constants');

const bssEmailVariables = (deal, facilityLists) => {
  const {
    ukefDealId,
    name,
    submissionType,
    maker,
    exporter,
  } = deal;

  const { firstname, surname } = maker;

  const emailVariables = {
    firstname,
    surname,
    exporterName: exporter.companyName,
    name,
    ukefDealId,
    isAin: submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN ? 'yes' : 'no',
    isMin: submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN ? 'yes' : 'no',
    issuedFacilitiesList: facilityLists.issued,
    showIssuedHeader: facilityLists.issued ? 'yes' : 'no',
    unissuedFacilitiesList: facilityLists.unissued,
    showUnissuedHeader: facilityLists.unissued ? 'yes' : 'no',
  };

  return emailVariables;
};

module.exports = bssEmailVariables;
