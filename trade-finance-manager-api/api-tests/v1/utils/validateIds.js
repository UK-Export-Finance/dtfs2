const { ObjectId } = require('mongodb');

const validateMongoId = (mongoId) => {
    if (!ObjectId.isValid(mongoId)) {
        throw new Error('Invalid Id provided %s', mongoId)
    }

    return mongoId;
}