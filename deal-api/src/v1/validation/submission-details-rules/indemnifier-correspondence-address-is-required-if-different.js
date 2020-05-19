const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  const { legallyDistinct } = submissionDetails;

  if (legallyDistinct === 'true') {
    const indemnifierCorrespondenceAddressIsDifferent = submissionDetails.indemnifierCorrespondenceAddressDifferent;

    if (indemnifierCorrespondenceAddressIsDifferent !== 'false' && indemnifierCorrespondenceAddressIsDifferent !== 'true') {
      newErrorList.indemnifierCorrespondenceAddressDifferent = {
        order: orderNumber(newErrorList),
        text: 'Guarantor/Indemnifier correspondence address is required',
      };
    } else if (indemnifierCorrespondenceAddressIsDifferent === 'true') {
      if (!hasValue(submissionDetails['indemnifier-correspondence-address-line-1'])) {
        newErrorList['indemnifier-correspondence-address-line-1'] = {
          order: orderNumber(newErrorList),
          text: 'Indemnifier correspondence address line 1 is required',
        };
      }

      if (!hasValue(submissionDetails['indemnifier-correspondence-address-line-2'])) {
        newErrorList['indemnifier-correspondence-address-line-2'] = {
          order: orderNumber(newErrorList),
          text: 'Indemnifier correspondence address line 2 is required',
        };
      }

      if (!hasValue(submissionDetails['indemnifier-correspondence-address-town'])) {
        newErrorList['indemnifier-correspondence-address-town'] = {
          order: orderNumber(newErrorList),
          text: 'Indemnifier correspondence town is required',
        };
      }

      // Cannot make county mandatory, as companies house does not provide a county field,
      //   so we would have validation failures for all addresses that come from CH lookup..
      //
      // if (!hasValue(submissionDetails['indemnifier-correspondence-address-county'])) {
      //   newErrorList['indemnifier-correspondence-address-county'] = {
      //     order: orderNumber(newErrorList),
      //     text: 'Indemnifier correspondence county is required',
      //   };
      // }

      if (!hasValue(submissionDetails['indemnifier-correspondence-address-postcode'])) {
        newErrorList['indemnifier-correspondence-address-postcode'] = {
          order: orderNumber(newErrorList),
          text: 'Indemnifier correspondence postcode is required',
        };
      }

      if (!hasValue(submissionDetails['indemnifier-correspondence-address-country'])) {
        newErrorList['indemnifier-correspondence-address-country'] = {
          order: orderNumber(newErrorList),
          text: 'Indemnifier correspondence country is required',
        };
      }
    }
  }
  return newErrorList;
};
