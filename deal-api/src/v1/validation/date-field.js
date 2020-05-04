// TODO: extract
const isEmptyString = (str) => {
  if ((typeof value === 'string' || str instanceof String) && !str.length) {
    return true;
  }
  return false;
};

// TODO: extract
const hasValue = (str) => {
  if (str && !isEmptyString(str)) {
    return true;
  }
  return false;
};

exports.dateIsValid = (day, month, year) => {
  const hasDay = hasValue(day);
  const hasMonth = hasValue(month);
  const hasYear = hasValue(year);

  const isValid = (hasDay && hasMonth && hasYear);
  return isValid;
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

  if (!hasDay && hasMonth && hasYear) {
    return `${fieldCopy} must include a day`;
  }

  return `Enter the ${fieldCopy}`;
};
