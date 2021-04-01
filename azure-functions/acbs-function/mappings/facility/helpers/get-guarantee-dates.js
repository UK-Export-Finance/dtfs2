const moment = require('moment');
const dateHelpers = require('../../../helpers/date');
const isIssued = require('./is-issued');

/*
Commitment i.e. unissued or conditional
Guarantee Commencement Date:  Submission Date plus 3 months
Guarantee Expiry Date:        Guarantee Commencement Date plus exposure period
Effective Date                Portal Submission Date

Issued
Guarantee Commencement Date:  Submission Date plus 3 months
Guarantee Expiry Date:        Guarantee Commencement Date plus exposure period
Effective Date                Cover Start Date

                              ACBS Effective Date     ACBS Issued Date
Commitment                    Portal Submission Date  (we don’t send)
Switch Commitment to Issued   Portal Submission Date  Cover Start Date
Issued (straight to Issued)   Cover Start Date        Cover Start Date

*/


const getGuaranteeDates = (facility, submissionDate) => {
  const guaranteeCommencementDate = moment(new Date(Number(submissionDate))).add(3, 'months').valueOf();
  let guaranteeExpiryDate;
  let effectiveDate;
  const { facilitySnapshot } = facility;

  if (isIssued(facility)) {
    guaranteeExpiryDate = dateHelpers.formatDate(`${facilitySnapshot['coverEndDate-year']}-${facilitySnapshot['coverEndDate-month']}-${facilitySnapshot['coverEndDate-day']}`);
    effectiveDate = facilitySnapshot.requestedCoverStartDate;
  } else {
    guaranteeExpiryDate = dateHelpers.formatTimestamp(
      moment(Number(guaranteeCommencementDate)).add(facilitySnapshot.ukefGuaranteeInMonths, 'months').valueOf(),
    );
    effectiveDate = submissionDate;
  }

  return {
    guaranteeCommencementDate: dateHelpers.formatTimestamp(guaranteeCommencementDate),
    guaranteeExpiryDate,
    effectiveDate,
  };
};

module.exports = getGuaranteeDates;
