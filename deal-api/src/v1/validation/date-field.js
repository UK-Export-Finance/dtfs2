const moment = require('moment');
const { hasValue } = require('../../utils/string');

exports.dateHasAllValues = (day, month, year) => {
  const hasDay = hasValue(day);
  const hasMonth = hasValue(month);
  const hasYear = hasValue(year);

  const hasValues = (hasDay && hasMonth && hasYear);
  return hasValues;
};

exports.dateHasSomeValues = (day, month, year) => {
  const hasDay = hasValue(day);
  const hasMonth = hasValue(month);
  const hasYear = hasValue(year);

  const hasSomeValues = (hasDay || hasMonth || hasYear);
  return hasSomeValues;
};

exports.dateValidationText = (
  fieldCopy,
  dayValue,
  monthValue,
  yearValue,
) => {
  const hasDay = hasValue(dayValue);
  const hasMonth = hasValue(monthValue);
  const hasYear = hasValue(yearValue);

  if (hasDay && !hasMonth && !hasYear) {
    return `${fieldCopy} must include month and year`;
  }

  if (hasDay && hasMonth && !hasYear) {
    return `${fieldCopy} must include a year`;
  }

  if (hasDay && !hasMonth && hasYear) {
    return `${fieldCopy} must include a month`;
  }

  if (!hasDay && hasMonth && !hasYear) {
    return `${fieldCopy} must include day and year`;
  }

  if (!hasDay && hasMonth && hasYear) {
    return `${fieldCopy} must include a day`;
  }

  if (!hasDay && !hasMonth && hasYear) {
    return `${fieldCopy} must include day and month`;
  }

  return `Enter the ${fieldCopy}`;
};

exports.now = () => moment();

exports.addDaysToDate = (date, days) => moment(date).add(days, 'day');

exports.removeDaysFromDate = (date, days) => moment(date).subtract(days, 'day');

exports.dateIsInTimeframe = (day, month, year, start, end) => {
  const formattedDate = moment(`${year}-${month}-${day}`);
  const isInTimeframe = moment(formattedDate).isBetween(start, end, 'days', '[]');

  if (isInTimeframe) {
    return true;
  }
  return false;
};
