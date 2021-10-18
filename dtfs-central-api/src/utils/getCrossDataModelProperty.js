const CONSTANTS = require('../constants');

const getProperty = (propertyPath) => propertyPath.split('.')[propertyPath.split('.').length - 1];

const getGEFProperty = (propertyPath) => {
  const property = getProperty(propertyPath);

  switch (property) {
    case 'supplier-name':
      return 'dealSnapshot.exporter.companyName';
    default:
      return propertyPath;
  }
};

const getCrossDataModelProperty = (deal, propertyPath) => {
  if (deal && propertyPath) {
    if (deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) return getGEFProperty(propertyPath);
  }
  return propertyPath;
};

module.exports = getCrossDataModelProperty;
