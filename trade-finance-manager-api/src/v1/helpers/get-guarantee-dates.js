const moment = require('moment');
const dateHelpers = require('../../utils/date');
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

  if (isIssued(facility)) {
    guaranteeExpiryDate = dateHelpers.formatDate(`${facility['coverEndDate-year']}-${facility['coverEndDate-month']}-${facility['coverEndDate-day']}`);
  } else {
    guaranteeExpiryDate = dateHelpers.formatTimestamp(
      moment(Number(guaranteeCommencementDate)).add(facility.ukefGuaranteeInMonths, 'months').valueOf(),
    );
  }

  return {
    guaranteeCommencementDate: dateHelpers.formatTimestamp(guaranteeCommencementDate),
    guaranteeExpiryDate,
    effectiveDate: dateHelpers.formatTimestamp(submissionDate),
  };
};

module.exports = getGuaranteeDates;
