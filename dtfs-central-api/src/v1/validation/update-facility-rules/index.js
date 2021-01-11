const userObject = require('./user-object');

const rules = [
  userObject,
];

module.exports = (facility) => {
  let errorList = {};

  for (let i = 0; i < rules.length; i += 1) {
    errorList = rules[i](facility, errorList);
  }

  return errorList;
};
