const { ObjectId } = require('mongodb');

const validMongoId = (mongoId) => {
  if (!ObjectId.isValid(mongoId)) {
    return false;
  }
  return mongoId;
};
