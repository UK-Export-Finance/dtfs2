const CONSTANTS = require('../../../constants');

const bssEmailVariables = (deal, facilityLists) => {
  const { ukefDealId, name, submissionType, maker, exporter } = deal;

  const { firstname, lastName } = maker;

  const emailVariables = {
    firstname,
    lastName,
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
