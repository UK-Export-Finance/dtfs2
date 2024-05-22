const Joi = require('joi');

const coverDatesValidation = (day, month, year) => {
  // if any dates are missing, return empty error objects
  if (!day || !month || !year) {
    return {
      coverYearValidation: {
        error: '',
      },
      coverMonthValidation: {
        error: '',
      },
      coverDayValidation: {
        error: '',
      },
    };
  }
  // schema to validate that the year is 4 digits long and only numbers
  const coverYearSchema = Joi.string().length(4).pattern(/^\d+$/).required();
  const coverYearValidation = coverYearSchema.validate(year.toString());
  // schema which ensures that month and day is only numbers and of length 1 or 2
  const coverDayMonthSchema = Joi.string().min(1).max(2).pattern(/^\d+$/);
  const coverMonthValidation = coverDayMonthSchema.validate(month.toString());
  const coverDayValidation = coverDayMonthSchema.validate(day.toString());

  return {
    coverYearValidation,
    coverMonthValidation,
    coverDayValidation,
  };
};

module.exports = coverDatesValidation;
