const moment = require('moment');
const dateHelpers = require('../../utils/date');

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

const getGuaranteeDates = (facility, dealSubmissionDate) => {
  let guaranteeCommencementDate;
  let guaranteeExpiryDate;

  const {
    hasBeenIssued,
    coverStartDate,
    coverEndDate,
    ukefGuaranteeInMonths,
  } = facility;

  if (hasBeenIssued) {
    guaranteeCommencementDate = dateHelpers.formatTimestamp(coverStartDate);
    guaranteeExpiryDate = dateHelpers.formatDate(coverEndDate);
  } else {
    guaranteeCommencementDate = dateHelpers.formatTimestamp(
      moment(Number(dealSubmissionDate)).add(3, 'months').valueOf(),
    );

    guaranteeExpiryDate = dateHelpers.formatTimestamp(
      moment(guaranteeCommencementDate).add(ukefGuaranteeInMonths, 'months').valueOf(),
    );
  }

  return {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate: dateHelpers.formatTimestamp(dealSubmissionDate),
  };
};

module.exports = getGuaranteeDates;
