const moment = require('moment');
const Joi = require('joi');
const { orderNumber } = require('../../../utils/error-list-order-number');
const {
  dateHasAllValues,
  dateValidationText,
} = require('./date');
const isReadyForValidation = require('../helpers/isReadyForValidation.helper');

module.exports = (submittedValues, deal, errorList) => {
  const newErrorList = errorList;
  const {
    'coverEndDate-day': coverEndDateDay,
    'coverEndDate-month': coverEndDateMonth,
    'coverEndDate-year': coverEndDateYear,
  } = submittedValues;

  if (isReadyForValidation(deal, submittedValues)) {
    if (dateHasAllValues(coverEndDateDay, coverEndDateMonth, coverEndDateYear)) {
      // schema to validate that the year is 4 digits long and only numbers
      const schema = Joi.string().length(4).pattern(/^[0-9]+$/).required();
      const validation = schema.validate(coverEndDateYear);

      // error object does not exist if no errors in validation
      if (validation.error) {
        newErrorList.coverEndDate = {
          text: 'The year for the Cover End Date must include 4 numbers',
          order: orderNumber(newErrorList),
        };
      }

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
  }

  return newErrorList;
};
