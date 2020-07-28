const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
  dateValidationText,
} = require('./date');

module.exports = (submittedValues, errorList) => {
  const newErrorList = errorList;

  const {
    'issuedDate-day': issuedDateDay,
    'issuedDate-month': issuedDateMonth,
    'issuedDate-year': issuedDateYear,
  } = submittedValues;

  // if (dateHasAllValues(issuedDateDay, issuedDateMonth, issuedDateYear)) {
  //   const formattedDate = `${issuedDateYear}-${issuedDateMonth}-${issuedDateDay}`;
  //   const nowDate = moment().format('YYYY-MM-DD');

    // if (moment(formattedDate).isBefore(nowDate)) {
    //   newErrorList.issuedDate = {
    //     text: 'Cover End Date must be today or in the future',
    //     order: orderNumber(newErrorList),
    //   };
    // }
  // }
  if (!dateHasAllValues(issuedDateDay, issuedDateMonth, issuedDateYear)) {
    newErrorList.issuedDate = {
      text: dateValidationText(
        'Issued Date',
        issuedDateDay,
        issuedDateMonth,
        issuedDateYear,
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
