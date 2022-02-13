const moment = require('moment');
const {
  dateHasAllValues,
  dateValidationText,
} = require('../date');
const { orderNumber } = require('../../../../utils/error-list-order-number.util');

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };

  const {
    'conversionRateDate-day': conversionRateDateDay,
    'conversionRateDate-month': conversionRateDateMonth,
    'conversionRateDate-year': conversionRateDateYear,
  } = facility;

  if (dateHasAllValues(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear)) {
    const formattedDate = `${conversionRateDateYear}-${conversionRateDateMonth}-${conversionRateDateDay}`;
    const nowDate = moment().format('YYYY-MM-DD');

    if (moment(formattedDate).isAfter(nowDate)) {
      newErrorList.conversionRateDate = {
        text: 'Conversion rate date must be today or in the past',
        order: orderNumber(newErrorList),
      };
    }

    const MAX_DAYS_FROM_NOW = moment(nowDate).subtract(29, 'day');

    if (moment(formattedDate).isBefore(MAX_DAYS_FROM_NOW)) {
      newErrorList.conversionRateDate = {
        text: `Conversion rate date must be between ${moment(MAX_DAYS_FROM_NOW).format('Do MMMM YYYY')} and ${moment(nowDate).format('Do MMMM YYYY')}`,
        order: orderNumber(newErrorList),
      };
    }
  } else if (!dateHasAllValues(conversionRateDateDay, conversionRateDateMonth, conversionRateDateYear)) {
    newErrorList.conversionRateDate = {
      text: dateValidationText(
        'Conversion rate date',
        conversionRateDateDay,
        conversionRateDateMonth,
        conversionRateDateYear,
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
