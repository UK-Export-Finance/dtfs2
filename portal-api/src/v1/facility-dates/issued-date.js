const { dateHasAllValues } = require('../validation/fields/date');

exports.hasAllIssuedDateValues = (facility) => {
  const { 'issuedDate-day': issuedDateDay, 'issuedDate-month': issuedDateMonth, 'issuedDate-year': issuedDateYear } = facility;

  const hasIssuedDate = dateHasAllValues(issuedDateDay, issuedDateMonth, issuedDateYear);

  if (hasIssuedDate) {
    return true;
  }

  return false;
};
