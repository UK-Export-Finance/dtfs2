const moment = require('moment');
const { orderNumber } = require('../../../utils/error-list-order-number.util');
const {
  dateHasAllValues,
  dateValidationText,
} = require('./date');

module.exports = (submittedValues, errorList) => {
  const newErrorList = errorList;

  const {
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
  } = submittedValues;

  if (dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
    const formattedDate = `${coverEndDateYear}-${coverEndDateMonth}-${coverEndDateDay}`;
    const nowDate = moment().format('YYYY-MM-DD');

    if (moment(formattedDate).isBefore(nowDate)) {
      newErrorList.coverEndDate = {
        text: 'Cover End Date must be today or in the future',
        order: orderNumber(newErrorList),
      };
    }
  } else if (!dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
    newErrorList.coverEndDate = {
      text: dateValidationText(
        'Cover End Date',
        coverEndDateDay,
        coverEndDateMonth,
        coverEndDateYear,
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
