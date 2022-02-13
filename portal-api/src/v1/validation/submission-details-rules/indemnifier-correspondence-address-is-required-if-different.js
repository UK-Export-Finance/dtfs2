const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

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

      if (submissionDetails['indemnifier-correspondence-address-country'] && submissionDetails['indemnifier-correspondence-address-country'].code === 'GBR') {
        if (!hasValue(submissionDetails['indemnifier-correspondence-address-postcode'])) {
          newErrorList['indemnifier-correspondence-address-postcode'] = {
            order: orderNumber(newErrorList),
            text: 'Indemnifier correspondence postcode is required for UK addresses',
          };
        }
      } else if (!hasValue(submissionDetails['indemnifier-correspondence-address-town'])) {
        newErrorList['indemnifier-correspondence-address-town'] = {
          order: orderNumber(newErrorList),
          text: 'Indemnifier correspondence town is required for non-UK addresses',
        };
      }

      if (!submissionDetails['indemnifier-correspondence-address-country']
        || !submissionDetails['indemnifier-correspondence-address-country'].code) {
        newErrorList['indemnifier-correspondence-address-country'] = {
          order: orderNumber(newErrorList),
          text: 'Indemnifier correspondence country is required',
        };
      }
    }
  }
  return newErrorList;
};
