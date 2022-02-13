const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  const { legallyDistinct } = submissionDetails;

  if (legallyDistinct !== 'false' && legallyDistinct !== 'true') {
    newErrorList.legallyDistinct = {
      order: orderNumber(newErrorList),
      text: 'Guarantor/Indemnifier is required',
    };
  } else if (legallyDistinct === 'true') {
    if (!hasValue(submissionDetails['indemnifier-name'])) {
      newErrorList['indemnifier-name'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier name is required',
      };
    }

    if (!hasValue(submissionDetails['indemnifier-address-line-1'])) {
      newErrorList['indemnifier-address-line-1'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier address line 1 is required',
      };
    }

    if (submissionDetails['indemnifier-address-country'] && submissionDetails['indemnifier-address-country'].code === 'GBR') {
      if (!hasValue(submissionDetails['indemnifier-address-postcode'])) {
        newErrorList['indemnifier-address-postcode'] = {
          order: orderNumber(newErrorList),
          text: 'Indemnifier postcode is required for UK addresses',
        };
      }
    } else if (!hasValue(submissionDetails['indemnifier-address-town'])) {
      newErrorList['indemnifier-address-town'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier town is required for non-UK addresses',
      };
    }

    if (!submissionDetails['indemnifier-address-country']
      || !submissionDetails['indemnifier-address-country'].code) {
      newErrorList['indemnifier-address-country'] = {
        order: orderNumber(newErrorList),
        text: 'Indemnifier country is required',
      };
    }
  }
  return newErrorList;
};
