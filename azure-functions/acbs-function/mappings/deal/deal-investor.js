const { to2Decimals } = require('../../helpers/currency');
const { getDealEffectiveDate } = require('./helpers');

/*
 "dealIdentifier":      Deal ACBS ID
  "effectiveDate":      As per deal Commencement date
  "currency":           Deal Currency,
  "maximumLiability":   Contract Value
*/


const dealInvestor = (deal) => {
  const { details, submissionDetails } = deal.dealSnapshot;

  return {
    dealIdentifier: details.ukefDealId.padStart(10, 0),
    currency: submissionDetails.supplyContractCurrency && submissionDetails.supplyContractCurrency.id,
    effectiveDate: getDealEffectiveDate(deal),
    maximumLiability: to2Decimals(submissionDetails.supplyContractValue),
  };
};

module.exports = dealInvestor;
