const { hasValue } = require('../../utils/string');

exports.hasAllIssuedDateValues = (facility) => {
  const { 'issuedDate-day': issuedDateDay, 'issuedDate-month': issuedDateMonth, 'issuedDate-year': issuedDateYear } = facility;

  const hasIssuedDate = hasValue(issuedDateDay) && hasValue(issuedDateMonth) && hasValue(issuedDateYear);

  return hasIssuedDate;
};
