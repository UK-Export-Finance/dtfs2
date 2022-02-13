const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');
const { countryIsDisabled } = require('../fields/country');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!submissionDetails['buyer-address-country']
    || !submissionDetails['buyer-address-country'].code) {
    newErrorList['buyer-address-country'] = {
      order: orderNumber(newErrorList),
      text: 'Buyer country is required',
    };
  }

  if (!hasValue(submissionDetails['buyer-address-line-1'])) {
    newErrorList['buyer-address-line-1'] = {
      order: orderNumber(newErrorList),
      text: 'Buyer address line 1 is required',
    };
  }

  if (submissionDetails['buyer-address-country'] && submissionDetails['buyer-address-country'].code === 'GBR') {
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

  if (submissionDetails['buyer-address-country']) {
    const isDisabled = countryIsDisabled(submissionDetails['buyer-address-country'].code);
    if (isDisabled) {
      newErrorList['buyer-address-country'] = {
        order: orderNumber(newErrorList),
        text: 'Buyer country is no longer available',
      };
    }
  }

  return newErrorList;
};
