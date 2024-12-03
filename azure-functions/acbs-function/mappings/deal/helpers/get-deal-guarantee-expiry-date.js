/*
 yyyy-MM-dd
ACBS guaranteeCommencementDate algorithm
provided by DM 23/03/2021
                              ACBS Effective Date     ACBS Issued Date
Commitment                    Portal Submission Date  (we don’t send)
Switch Commitment to Issued   Portal Submission Date  Cover Start Date
Issued (straight to Issued    Cover Start Date        Cover Start Date
*/
const { formatDate, addYear } = require('../../../helpers/date');
const getDealSubmissionDate = require('./get-deal-submission-date');
const CONSTANT = require('../../../constants/product');

const getDealGuaranteeExpiryDate = (deal) => {
  if (deal.dealSnapshot.dealType === CONSTANT.TYPE.GEF) {
    return addYear(formatDate(deal.dealSnapshot.submissionDate), 20);
  }

  const latestGuaranteeExpiry = deal.dealSnapshot.facilities.reduce(
    (latestDate, facility) => {
      const { guaranteeExpiryDate } = facility.tfm.facilityGuaranteeDates;
      return guaranteeExpiryDate > latestDate ? guaranteeExpiryDate : latestDate;
    },
    formatDate(getDealSubmissionDate(deal)),
  );

  return latestGuaranteeExpiry;
};

module.exports = getDealGuaranteeExpiryDate;
