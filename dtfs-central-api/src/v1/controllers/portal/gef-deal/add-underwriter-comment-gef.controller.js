const { ObjectID } = require('mongodb');
const { findOneDeal } = require('./get-gef-deal.controller');
const db = require('../../../../drivers/db-client');

const addComment = async (_id, commentType, comment) => {
  // get the deals collection
  const collection = await db.getCollection('deals');

  // add the comment to the matching deal (based on _id)
  const addCommentToGefDeal = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectID(String(_id)) } },
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
  );

  const { value } = addCommentToGefDeal;

  return value;
};
exports.addDealComment = addComment;

exports.addUnderwriterCommentToGefDeal = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      const { commentType, comment } = req.body;

      const updatedDeal = await addComment(dealId, commentType, comment);

      res.status(200).json(updatedDeal);
    }
    res.status(404).send();
  });
};
