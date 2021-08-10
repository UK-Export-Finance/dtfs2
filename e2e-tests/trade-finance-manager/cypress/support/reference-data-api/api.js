// mock out number generator call and use 10 digit ID instead
let ukefId = 1e10;
module.exports.getIdFromNumberGenerator = () => {
  ukefId += 1;
  return String(ukefId);
};
