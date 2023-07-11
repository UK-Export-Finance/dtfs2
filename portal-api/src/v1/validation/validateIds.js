const validator = require('validator');

const isValidMongoId = (mongoId) => {
  if (!mongoId) {
    return false;
  }
  return validator.isMongoId(mongoId);
};

module.exports = {
  isValidMongoId,
};
