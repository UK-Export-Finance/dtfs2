const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');

const addDealComment = async (_id, commentType, comment) => {
  const collection = await db.getCollection('deals');

  const response = await collection.findOneAndUpdate(
    { _id: ObjectId(_id) },
    {
      $push: {
        [commentType]: {
          $each: [{
            ...comment,
            timestamp: Date.now(),
          }],
          $position: 0,
        },
      },
    },
    { returnDocument: 'after', returnNewDocument: true }
  );

  return response.value;
};
exports.postCommentToDeal = async (req, res) => {
  const { id: dealId } = req.params;
  const { commentType, comment } = req.body;

  const updatedDeal = await addDealComment(dealId, commentType, comment);
  const status = updatedDeal ? 200 : 400;
  return res.status(status).send(updatedDeal);
};
