const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(submissionDetails['supplier-correspondence-address-line-1'])) {
    newErrorList['supplier-correspondence-address-line-1'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier correspondence address line 1 is required',
    };
  }

  if (!hasValue(submissionDetails['supplier-correspondence-address-line-2'])) {
    newErrorList['supplier-correspondence-address-line-2'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier correspondence address line 2 is required',
    };
  }

  if (!hasValue(submissionDetails['supplier-correspondence-address-town'])) {
    newErrorList['supplier-correspondence-address-town'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier correspondence town is required',
    };
  }

  // Cannot make county mandatory, as companies house does not provide a county field,
  //   so we would have validation failures for all addresses that come from CH lookup..
  //
  // if (!hasValue(submissionDetails['supplier-correspondence-address-county'])) {
  //   newErrorList['supplier-correspondence-address-county'] = {
  //     order: orderNumber(newErrorList),
  //     text: 'Supplier correspondence county is required',
  //   };
  // }

  if (!hasValue(submissionDetails['supplier-correspondence-address-postcode'])) {
    newErrorList['supplier-correspondence-address-postcode'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier correspondence postcode is required',
    };
  }

  if (!hasValue(submissionDetails['supplier-correspondence-address-country'])) {
    newErrorList['supplier-correspondence-address-country'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier correspondence country is required',
    };
  }

  return newErrorList;
};
