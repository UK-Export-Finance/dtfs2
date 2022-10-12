const { ObjectId } = require('mongodb');
const db = require('../../../../database/mongo-client');
const { findOneGefDeal, findOneBssDeal } = require('./get-deal.controller');

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

exports.postCommentToBssDeal = async (req, res) => {
  const dealId = req.params.id;

  const deal = await findOneBssDeal(dealId);
  if (deal) {
    const { commentType, comment } = req.body;
    const updatedDeal = await addDealComment(dealId, commentType, comment);
    return res.status(200).send(updatedDeal);
  }
  return res.status(404).send({ status: 400, message: 'Deal not found' });
};

exports.postCommentToGefDeal = async (req, res) => {
  const dealId = req.params.id;

  const deal = await findOneGefDeal(dealId);
  if (deal) {
    const { commentType, comment } = req.body;
    const updatedDeal = await addDealComment(dealId, commentType, comment);
    return res.status(200).send(updatedDeal);
  }
  return res.status(404).send({ status: 400, message: 'Deal not found' });
};
