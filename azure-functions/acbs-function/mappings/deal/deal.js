const {
  getDealEffectiveDate,
  getDealValue,
  getDealId,
  getDealCurrency,
} = require('./helpers');
const { formatTimestamp } = require('../../helpers/date');
const getDealSubmissionDate = require('./helpers/get-deal-submission-date');

/*
  dealIdentifier                  string    UKEF ID
  currency                        string    deal currency code
  dealValue                       float     Must be 2 decimal places
  guaranteeCommencementDate       date      yyyy-MM-dd - see algorithm below
  obligorPartyIdentifier          string    Supplier ACBS ID returned from ACBS Create Customer API call
  obligorName                     string    supplier name
  obligorIndustryClassification   string    ACBS Supplier industry classification - must be 4 characters e.g. 0104
  creditReviewRiskDate            date      YYYY-MM-DD
*/

/*
ACBS guaranteeCommencementDate algorithm
provided by DM 23/03/2021
                              ACBS Effective Date     ACBS Issued Date
Commitment                    Portal Submission Date  (we don’t send)
Switch Commitment to Issued   Portal Submission Date  Cover Start Date
Issued (straight to Issued)   Cover Start Date        Cover Start Date
*/

const initialDeal = (deal, obligorPartyIdentifier, acbsReference) => ({
  _id: deal._id,
  dealIdentifier: getDealId(deal),
  currency: getDealCurrency(deal),
  dealValue: getDealValue(deal),
  guaranteeCommencementDate: getDealEffectiveDate(deal),
  obligorPartyIdentifier,
  obligorName: deal.dealSnapshot.exporter.companyName.substring(0, 35),
  obligorIndustryClassification: acbsReference.supplierAcbsIndustryCode,
  creditReviewRiskDate: formatTimestamp(getDealSubmissionDate(deal)),
});

module.exports = initialDeal;
