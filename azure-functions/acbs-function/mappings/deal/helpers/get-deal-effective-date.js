/*
 yyyy-MM-dd
ACBS guaranteeCommencementDate algorithm
provided by DM 23/03/2021
                              ACBS Effective Date     ACBS Issued Date
Commitment                    Portal Submission Date  (we don’t send)
Switch Commitment to Issued   Portal Submission Date  Cover Start Date
Issued (straight to Issued    Cover Start Date        Cover Start Date
*/
const { formatTimestamp } = require('../../../helpers/date');
const CONSTANT = require('../../../constants/product');

const getDealEffectiveDate = (deal) => {
  if (deal.dealSnapshot.dealType === CONSTANT.TYPE.GEF) {
    return formatTimestamp(deal.dealSnapshot.submissionDate);
  }

  const earliestGuaranteeDate = deal.reduce((earliestDate, facility) => {
    const { effectiveDate } = facility.tfm.facilityGuaranteeDates;
    return effectiveDate < earliestDate ? effectiveDate : earliestDate;
  }, formatTimestamp(deal.submittedDate));

  return earliestGuaranteeDate;
};

module.exports = getDealEffectiveDate;
