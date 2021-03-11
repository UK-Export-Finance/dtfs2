const { to2Decimals } = require('../../helpers/currency');
const { now } = require('../../helpers/date');

/*
  dealIdentifier                  string    UKEF ID
  currency                        string    deal currency code
  dealValue                       float     Must be 2 decimal places
  guaranteeCommencementDate       date      yyyy-MM-dd - we currently work this out per facility rather than deal. what should go here?
  obligorPartyIdentifier          string    Supplier ACBS ID returned from ACBS Create Customer API call
  obligorName                     string    supplier name
  obligorIndustryClassification   string    Supplier industry classification
*/

const initialDeal = (deal, obligorPartyIdentifier, obligorIndustryClassification = '0001') => {
  const { details, submissionDetails } = deal.dealSnapshot;

  return {
    dealIdentifier: details.ukefDealId,
    currency: submissionDetails.supplyContractCurrency && submissionDetails.supplyContractCurrency.id,
    dealValue: to2Decimals(submissionDetails.supplyContractValue),
    guaranteeCommencementDate: now(),
    obligorPartyIdentifier,
    obligorName: submissionDetails['supplier-name'],
    obligorIndustryClassification: String(obligorIndustryClassification),
  };
};

module.exports = initialDeal;
