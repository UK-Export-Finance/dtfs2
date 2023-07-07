const { ObjectId } = require('mongodb');

exports.validMongoId = (mongoId) => {
  if (!ObjectId.isValid(mongoId)) {
    return false;
  }

  return mongoId;
};

exports.validUkefNumericId = (ukefId) => {
  const id = parseInt(ukefId, 10);

  if (Number.isNaN(id)) {
    return false;
  }

  const regex = /^[0-9]{10}$/;

  if (!regex.test(ukefId)) {
    return false;
  }

  return ukefId;
};
