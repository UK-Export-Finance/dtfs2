const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(submissionDetails['buyer-address-line-1'])) {
    newErrorList['buyer-address-line-1'] = {
      order: orderNumber(newErrorList),
      text: 'Buyer address line 1 is required',
    };
  }

  if (submissionDetails['buyer-address-country'] === 'GBR') {
    if (!hasValue(submissionDetails['buyer-address-postcode'])) {
      newErrorList['buyer-address-postcode'] = {
        order: orderNumber(newErrorList),
        text: 'Buyer postcode is required for UK addresses',
      };
    }
  } else if (!hasValue(submissionDetails['buyer-address-town'])) {
    newErrorList['buyer-address-town'] = {
      order: orderNumber(newErrorList),
      text: 'Buyer town is required for non-UK addresses',
    };
  }

  if (!hasValue(submissionDetails['buyer-address-country'])) {
    newErrorList['buyer-address-country'] = {
      order: orderNumber(newErrorList),
      text: 'Buyer country is required',
    };
  }

  return newErrorList;
};
