const CONSTANTS = require('../constants');

const getBSSProperty = (propertyPath) => {
  switch (propertyPath) {
    case 'dealSnapshot.ukefDealId':
      return 'dealSnapshot.details.ukefDealId';
    case 'dealSnapshot.exporter.companyName':
      return 'dealSnapshot.submissionDetails.supplier-name';
    case 'dealSnapshot.buyer.companyName':
      return 'dealSnapshot.submissionDetails.buyer-name';
    case 'dealSnapshot.details.owningBank.name':
      return 'dealSnapshot.bank.name';
    default:
      return propertyPath;
  }
};

const getCrossDataModelProperty = (deal, propertyPath) => {
  if (deal && propertyPath) {
    if (deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) return getBSSProperty(propertyPath);
  }
  return propertyPath;
};

module.exports = getCrossDataModelProperty;
