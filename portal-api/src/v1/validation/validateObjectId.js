const { ObjectId } = require('mongodb');

const hasValidObjectId = (objectId) => ObjectId.isValid(objectId);

module.exports = { hasValidObjectId };
