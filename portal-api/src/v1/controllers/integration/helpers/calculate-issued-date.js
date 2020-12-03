const moment = require('moment');
const dateHelpers = require('./date-helpers');

const calculateIssuedDate = (facility, submissionDate) => {
  const guaranteeCommencementDate = facility.requestedCoverStartDate || moment(new Date(Number(submissionDate))).add(3, 'months').valueOf();
  const requestedCoverEndDate = dateHelpers.formatDate(facility['coverEndDate-day'], facility['coverEndDate-month'], facility['coverEndDate-year']);

  const coverExpiryDate = requestedCoverEndDate || dateHelpers.formatTimestamp(moment(Number(guaranteeCommencementDate)).add(facility.ukefGuaranteeInMonths, 'months').valueOf());

  return {
    guaranteeCommencementDate: dateHelpers.formatTimestamp(guaranteeCommencementDate),
    coverExpiryDate,
  };
};

module.exports = calculateIssuedDate;
