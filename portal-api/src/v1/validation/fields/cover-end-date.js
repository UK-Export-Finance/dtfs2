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
      const coverEndDateYearSchema = Joi.string().length(4).pattern(/^[0-9]+$/).required();
      const coverEndDateYearValidation = coverEndDateYearSchema.validate(coverEndDateYear);
      // schema which ensures that coverEnd month and day is only numbers and of length 1 or 2
      const coverDayMonthSchema = Joi.string().min(1).max(2).pattern(/^[0-9]+$/);
      const coverMonthValidation = coverDayMonthSchema.validate(coverEndDateMonth);
      const coverDayValidation = coverDayMonthSchema.validate(coverEndDateDay);

      const formattedDate = `${coverEndDateYear}-${coverEndDateMonth}-${coverEndDateDay}`;
      const nowDate = moment().format('YYYY-MM-DD');
      if (moment(formattedDate).isBefore(nowDate)) {
        newErrorList.coverEndDate = {
          text: 'Cover End Date must be today or in the future',
          order: orderNumber(newErrorList),
        };
      }

      // check if cover start day only has 2 numbers
      if (coverDayValidation.error) {
        newErrorList.coverEndDate = {
          text: 'The day for the cover end date must only include 1 or 2 numbers',
          order: orderNumber(newErrorList),
        };
      }

      // check if cover end month only has 2 numbers
      if (coverMonthValidation.error) {
        newErrorList.coverEndDate = {
          text: 'The month for the cover end date must only include 1 or 2 numbers',
          order: orderNumber(newErrorList),
        };
      }

      // error object does not exist if no errors in validation
      if (coverEndDateYearValidation.error) {
        newErrorList.coverEndDate = {
          text: 'The year for the Cover End Date must include 4 numbers',
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
