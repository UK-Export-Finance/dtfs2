const moment = require('moment');
const dateHelpers = require('../../utils/date');

/*
Commitment / Un-issued / 06
----------------------------
guaranteeCommencementDate     Deal submission Date
guaranteeExpiryDate           Guarantee Commencement Date plus exposure period
effectiveDate                 Deal submission Date

Issued / 07
-----------
guaranteeCommencementDate     Cover start date
guaranteeExpiryDate           Cover end date
effectiveDate                 Deal submission Date
*/

const getGuaranteeDates = (facility, dealSubmissionDate) => {
  let guaranteeCommencementDate;
  let guaranteeExpiryDate;

  const { hasBeenIssued, coverStartDate, coverEndDate, ukefGuaranteeInMonths } = facility;

  if (hasBeenIssued) {
    guaranteeCommencementDate = dateHelpers.formatTimestamp(coverStartDate);
    guaranteeExpiryDate = dateHelpers.formatDate(coverEndDate);
  } else {
    guaranteeCommencementDate = dateHelpers.formatTimestamp(Number(dealSubmissionDate));
    guaranteeExpiryDate = dateHelpers.formatTimestamp(moment(guaranteeCommencementDate).add(ukefGuaranteeInMonths, 'months').valueOf());
  }

  return {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate: dateHelpers.formatTimestamp(dealSubmissionDate),
  };
};

module.exports = getGuaranteeDates;
