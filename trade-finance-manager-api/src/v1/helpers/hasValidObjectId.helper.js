const { ObjectId } = require('mongodb');

exports.hasValidObjectId = (objectId) => ObjectId.isValid(objectId);
