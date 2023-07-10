const validator = require('validator');

const isValidMongoId = (mongoId) => validator.isMongoId(mongoId);

module.exports = {
  isValidMongoId,
};
