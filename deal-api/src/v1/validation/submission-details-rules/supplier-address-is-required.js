const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(submissionDetails['supplier-address-line-1'])) {
    newErrorList['supplier-address-line-1'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier address line 1 is required',
    };
  }

  if (!hasValue(submissionDetails['supplier-address-line-2'])) {
    newErrorList['supplier-address-line-2'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier address line 2 is required',
    };
  }

  if (!hasValue(submissionDetails['supplier-address-town'])) {
    newErrorList['supplier-address-town'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier town is required',
    };
  }

  // Cannot make county mandatory, as companies house does not provide a county field,
  //   so we would have validation failures for all addresses that come from CH lookup..
  //
  // if (!hasValue(submissionDetails['supplier-address-county'])) {
  //   newErrorList['supplier-address-county'] = {
  //     order: orderNumber(newErrorList),
  //     text: 'Supplier county is required',
  //   };
  // }

  if (!hasValue(submissionDetails['supplier-address-postcode'])) {
    newErrorList['supplier-address-postcode'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier postcode is required',
    };
  }

  if (!hasValue(submissionDetails['supplier-address-country'])) {
    newErrorList['supplier-address-country'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier country is required',
    };
  }

  return newErrorList;
};
