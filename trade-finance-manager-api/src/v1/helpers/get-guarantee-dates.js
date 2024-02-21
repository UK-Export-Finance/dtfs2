const { add, format, parseISO } = require('date-fns');
const { formatTimestamp, getDateAsEpochMillisecondString } = require('../../utils/date');

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
    guaranteeCommencementDate = formatTimestamp(coverStartDate);
    guaranteeExpiryDate = format(parseISO(coverEndDate), 'yyyy-MM-dd');
  } else {
    guaranteeCommencementDate = formatTimestamp(Number(dealSubmissionDate));
    guaranteeExpiryDate = formatTimestamp(
      getDateAsEpochMillisecondString(
        add(new Date(Number(dealSubmissionDate)), {
          months: ukefGuaranteeInMonths,
        }),
      ),
    );
  }

  return {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate: formatTimestamp(dealSubmissionDate),
  };
};

module.exports = getGuaranteeDates;
