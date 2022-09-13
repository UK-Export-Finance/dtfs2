const Joi = require('joi');

const coverDatesValidation = (day, month, year) => {
// schema to validate that the year is 4 digits long and only numbers
  const coverYearSchema = Joi.string().length(4).pattern(/^\d+$/).required();
  const coverYearValidation = coverYearSchema.validate(year);
  // schema which ensures that month and day is only numbers and of length 1 or 2
  const coverDayMonthSchema = Joi.string().min(1).max(2).pattern(/^\d+$/);
  const coverMonthValidation = coverDayMonthSchema.validate(month);
  const coverDayValidation = coverDayMonthSchema.validate(day);

  return {
    coverYearValidation,
    coverMonthValidation,
    coverDayValidation
  };
};

module.exports = coverDatesValidation;
