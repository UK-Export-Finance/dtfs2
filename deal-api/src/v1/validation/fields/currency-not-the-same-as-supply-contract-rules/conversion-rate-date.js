const moment = require('moment');
const {
  dateHasAllValues,
  dateValidationText,
} = require('../date');
const { orderNumber } = require('../../../../utils/error-list-order-number');

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
