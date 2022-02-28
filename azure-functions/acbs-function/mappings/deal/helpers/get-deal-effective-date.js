/*
 yyyy-MM-dd
ACBS guaranteeCommencementDate algorithm
provided by DM 23/03/2021
                              ACBS Effective Date     ACBS Issued Date
Commitment                    Portal Submission Date  (we don’t send)
Switch Commitment to Issued   Portal Submission Date  Cover Start Date
Issued (straight to Issued    Cover Start Date        Cover Start Date
*/
const { formatTimestamp, formatDate } = require('../../../helpers/date');
const getDealSubmissionDate = require('./get-deal-submission-date');
const getCoverStartDate = require('../../facility/helpers/get-cover-start-date');

const getDealEffectiveDate = (deal) => {
  const submissionDate = formatTimestamp(getDealSubmissionDate(deal));
  const earliestGuaranteeDate = deal.dealSnapshot.facilities.reduce((earliestDate, facility) => {
    let effectiveDate;
    if (facility.tfm.facilityGuaranteeDates) {
      effectiveDate = facility.facilitySnapshot.hasBeenIssued
        ? formatDate(getCoverStartDate(facility, true))
        : facility.tfm.facilityGuaranteeDates.effectiveDate;
    }
    if (earliestDate === submissionDate) {
      return effectiveDate > earliestDate ? effectiveDate : earliestDate;
    }
    return effectiveDate < earliestDate ? effectiveDate : earliestDate;
  }, submissionDate);

  return earliestGuaranteeDate;
};

module.exports = getDealEffectiveDate;
