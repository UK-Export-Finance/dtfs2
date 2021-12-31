const CONSTANTS = require('../constants');
const { hasValue } = require('../utils/string');

const getBSSProperty = (propertyPath) => {
  if (hasValue(propertyPath)) {
    switch (propertyPath) {
      case 'dealSnapshot.ukefDealId':
        return 'dealSnapshot.details.ukefDealId';
      case 'dealSnapshot.exporter.companyName':
        return 'dealSnapshot.submissionDetails.supplier-name';
      case 'dealSnapshot.buyer.companyName':
        return 'dealSnapshot.submissionDetails.buyer-name';
      default:
        return propertyPath;
    }
  }
  return null;
};

const mapDataModel = (deal, propertyPath) => {
  if (deal && propertyPath) {
    if (deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) return getBSSProperty(propertyPath);
  }
  return propertyPath;
};

module.exports = mapDataModel;
