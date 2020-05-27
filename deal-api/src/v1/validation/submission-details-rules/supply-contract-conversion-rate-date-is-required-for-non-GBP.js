const moment = require('moment');

const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  // check to see if we're a non-GBP currency
  if (hasValue(submissionDetails.supplyContractCurrency) && submissionDetails.supplyContractCurrency.id !== 'GBP') {
    const day = submissionDetails['supplyContractConversionDate-day'];
    const month = submissionDetails['supplyContractConversionDate-month'];
    const year = submissionDetails['supplyContractConversionDate-year'];

    // if we have all the values, check that the date is in the past..
    if (hasValue(day) && hasValue(month) && hasValue(year)) {
      const date = `${year}/${month}/${day}`;
      const now = moment().format('YYYY/MM/DD');

      if (date > now) {
        newErrorList.supplyContractConversionDate = {
          order: orderNumber(newErrorList),
          text: 'Supply Contract conversion date cannot be in the future',
        };
      }
    } else {
      // if we don't have all the values, raise an error against the date..
      newErrorList.supplyContractConversionDate = {
        order: orderNumber(newErrorList),
        text: 'Supply Contract conversion date is required for non-GBP currencies',
      };

      // if we have one or more fields, but not all the fields - flag the missing fields as required
      if (hasValue(day) || hasValue(month) || hasValue(year)) {
        if (!hasValue(day)) {
          newErrorList['supplyContractConversionDate-day'] = {
            order: orderNumber(newErrorList),
            text: 'Supply Contract conversion date Day is required for non-GBP currencies',
          };
        }
        if (!hasValue(month)) {
          newErrorList['supplyContractConversionDate-month'] = {
            order: orderNumber(newErrorList),
            text: 'Supply Contract conversion date Month is required for non-GBP currencies',
          };
        }
        if (!hasValue(year)) {
          newErrorList['supplyContractConversionDate-year'] = {
            order: orderNumber(newErrorList),
            text: 'Supply Contract conversion date Year is required for non-GBP currencies',
          };
        }
      }
    }
  }
  return newErrorList;
};
