/**
 * mock out number generator call and use zero-prefixed 10 digit UKEF ID format ("00" + 8 digits)
 * reduced in size from 10 as premium schedule cannot handle large numbers
 */
let ukefId = 0;

module.exports.getIdFromNumberGenerator = () => {
  ukefId += 1;
  return String(ukefId).padStart(10, '0');
};
