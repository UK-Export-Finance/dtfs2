const rules = [];

module.exports = (facility) => {
  let errorList = {};

  for (let index = 0; index < rules.length; index += 1) {
    errorList = rules[index](facility, errorList);
  }

  return errorList;
};
