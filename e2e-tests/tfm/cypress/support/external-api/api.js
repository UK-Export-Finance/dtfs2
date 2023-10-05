// mock out number generator call and use 7 digit ID instead
// reduced in size from 10 as premium schedule cannot handle large numbers
let ukefId = 1e7;
module.exports.getIdFromNumberGenerator = () => {
  ukefId += 1;
  return String(ukefId);
};
