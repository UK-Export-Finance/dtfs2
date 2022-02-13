const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  const differentAddressSelected = submissionDetails['supplier-correspondence-address-is-different'];

  if (differentAddressSelected !== 'false' && differentAddressSelected !== 'true') {
    newErrorList['supplier-correspondence-address-is-different'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier correspondence address is required',
    };
  } else if (differentAddressSelected === 'true') {
    if (!hasValue(submissionDetails['supplier-correspondence-address-line-1'])) {
      newErrorList['supplier-correspondence-address-line-1'] = {
        order: orderNumber(newErrorList),
        text: 'Supplier correspondence address line 1 is required',
      };
    }

    if (submissionDetails['supplier-correspondence-address-country'] && submissionDetails['supplier-correspondence-address-country'].code === 'GBR') {
      if (!hasValue(submissionDetails['supplier-correspondence-address-postcode'])) {
        newErrorList['supplier-correspondence-address-postcode'] = {
          order: orderNumber(newErrorList),
          text: 'Supplier correspondence postcode is required for UK addresses',
        };
      }
    } else if (!hasValue(submissionDetails['supplier-correspondence-address-town'])) {
      newErrorList['supplier-correspondence-address-town'] = {
        order: orderNumber(newErrorList),
        text: 'Supplier correspondence town is required for non-UK addresses',
      };
    }

    if (!submissionDetails['supplier-correspondence-address-country']
      || !submissionDetails['supplier-correspondence-address-country'].code) {
      newErrorList['supplier-correspondence-address-country'] = {
        order: orderNumber(newErrorList),
        text: 'Supplier correspondence country is required',
      };
    }
  }

  return newErrorList;
};
