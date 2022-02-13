const { hasValue } = require('../../utils/string.util');

exports.hasAllIssuedDateValues = (facility) => {
  const {
    'issuedDate-day': issuedDateDay,
    'issuedDate-month': issuedDateMonth,
    'issuedDate-year': issuedDateYear,
  } = facility;

  const hasIssuedDate = (hasValue(issuedDateDay)
    && hasValue(issuedDateMonth)
    && hasValue(issuedDateYear));

  if (hasIssuedDate) {
    return true;
  }

  return false;
};
