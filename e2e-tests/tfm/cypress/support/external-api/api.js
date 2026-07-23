/**
 * Mock out number generator call and use a zero-prefixed 10 digit UKEF ID format ("00" + 8 digits).
 * Keep numeric values small to avoid issues in downstream test calculations.
 */
let ukefId = 0;

module.exports.getIdFromNumberGenerator = () => {
  ukefId += 1;
  return String(ukefId).padStart(10, '0');
};
