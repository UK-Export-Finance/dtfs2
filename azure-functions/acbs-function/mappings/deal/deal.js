const { to2Decimals } = require('../../helpers/currency');
const { getDealEffectiveDate } = require('./helpers');

/*
  dealIdentifier                  string    UKEF ID
  currency                        string    deal currency code
  dealValue                       float     Must be 2 decimal places
  guaranteeCommencementDate       date      yyyy-MM-dd - see algorithm below
  obligorPartyIdentifier          string    Supplier ACBS ID returned from ACBS Create Customer API call
  obligorName                     string    supplier name
  obligorIndustryClassification   string    ACBS Supplier industry classification - must be 4 characters e.g. 0104
*/

/*
ACBS guaranteeCommencementDate algorithm
provided by darren McGuirk 23/03/2021
                              ACBS Effective Date     ACBS Issued Date
Commitment                    Portal Submission Date  (we don’t send)
Switch Commitment to Issued   Portal Submission Date  Cover Start Date
Issued (straight to Issued)   Cover Start Date        Cover Start Date
*/

const initialDeal = (deal, obligorPartyIdentifier, acbsReference) => {
  const { details, submissionDetails } = deal.dealSnapshot;

  return {
    dealIdentifier: details.ukefDealId.padStart(10, 0),
    currency: submissionDetails.supplyContractCurrency && submissionDetails.supplyContractCurrency.id,
    dealValue: to2Decimals(submissionDetails.supplyContractValue),
    guaranteeCommencementDate: getDealEffectiveDate(deal),
    obligorPartyIdentifier,
    obligorName: submissionDetails['supplier-name'],
    obligorIndustryClassification: acbsReference.supplierAcbsIndustryCode,
  };
};

module.exports = initialDeal;
