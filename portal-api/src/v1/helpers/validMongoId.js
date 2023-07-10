const { ObjectId } = require('mongodb');

const validMongoId = (objectId) => {
  if (!objectId) {
    return false;
  }

  return ObjectId.isValid(objectId);
};

module.exports = validMongoId;
