const { hasValue } = require('../../../utils/string');

/**
 * @param {string} day day of the month
 * @param {string} month month of the year
 * @param {string} year
 * @returns true if all three are non-empty strings
 */
exports.dateHasAllValues = (day, month, year) => {
  const hasDay = hasValue(day);
  const hasMonth = hasValue(month);
  const hasYear = hasValue(year);

  const hasValues = hasDay && hasMonth && hasYear;
  return hasValues;
};

/**
 * @param {string} day day of the month
 * @param {string} month month of the year
 * @param {string} year
 * @returns true if any is non-empty string
 */
exports.dateHasSomeValues = (day, month, year) => {
  const hasDay = hasValue(day);
  const hasMonth = hasValue(month);
  const hasYear = hasValue(year);

  const hasSomeValues = hasDay || hasMonth || hasYear;
  return hasSomeValues;
};

exports.dateValidationText = (fieldTitle, dayValue, monthValue, yearValue) => {
  const hasDay = hasValue(dayValue);
  const hasMonth = hasValue(monthValue);
  const hasYear = hasValue(yearValue);

  if (hasDay && !hasMonth && !hasYear) {
    return `${fieldTitle} must include month and year`;
  }

  if (hasDay && hasMonth && !hasYear) {
    return `${fieldTitle} must include a year`;
  }

  if (hasDay && !hasMonth && hasYear) {
    return `${fieldTitle} must include a month`;
  }

  if (!hasDay && hasMonth && !hasYear) {
    return `${fieldTitle} must include day and year`;
  }

  if (!hasDay && hasMonth && hasYear) {
    return `${fieldTitle} must include a day`;
  }

  if (!hasDay && !hasMonth && hasYear) {
    return `${fieldTitle} must include day and month`;
  }

  return `Enter the ${fieldTitle}`;
};
