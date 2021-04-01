/*
 yyyy-MM-dd
ACBS guaranteeCommencementDate algorithm
provided by darren McGuirk 23/03/2021
                              ACBS Effective Date     ACBS Issued Date
Commitment                    Portal Submission Date  (we don’t send)
Switch Commitment to Issued   Portal Submission Date  Cover Start Date
Issued (straight to Issued    Cover Start Date        Cover Start Date
*/
const { formatTimestamp } = require('../../../helpers/date');
const getGuaranteeDates = require('../../facility/helpers/get-guarantee-dates');

const getDealEffectiveDate = ({ dealSnapshot }) => {
  const { facilities } = dealSnapshot;

  const { submissionDate } = dealSnapshot.details;

  const earliestGuaranteeDate = facilities.reduce((earliestDate, facility) => {
    const { effectiveDate } = getGuaranteeDates(facility, submissionDate);
    return effectiveDate < earliestDate ? effectiveDate : earliestDate;
  }, submissionDate);

  return formatTimestamp(earliestGuaranteeDate);
};

module.exports = getDealEffectiveDate;
