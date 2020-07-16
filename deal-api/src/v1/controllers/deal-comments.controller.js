const db = require('../../drivers/db-client');
const now = require('../../now');

const insertIntoDb = async (_id, commentField, commentToInsert) => {
  const collection = await db.getCollection('deals');

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
    {
      $push: {
        [commentField]: {
          $each: [commentToInsert],
          $position: 0,
        },
      },
    },
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

exports.addComment = async (_id, commentToAdd, user) => {
  const commentToInsert = {
    user,
    timestamp: now(),
    text: commentToAdd,
  };

  const value = await insertIntoDb(_id, 'comments', commentToInsert);
  return value;
};

exports.addSpecialConditions = async (_id, commentToAdd, user) => {
  const commentToInsert = {
    user,
    timestamp: now(),
    text: commentToAdd,
  };

  const value = await insertIntoDb(_id, 'specialConditions', commentToInsert);
  return value;
};
