const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('./get-deal.controller');

const addDealComment = async (_id, commentType, comment) => {
  const collection = await db.getCollection('deals');

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id },
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
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};
exports.addDealComment = addDealComment;

exports.addDealCommentPost = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (deal) {
      const { commentType, comment } = req.body;

      const updatedDeal = await addDealComment(dealId, commentType, comment);

      res.status(200).json(updatedDeal);
    }
    res.status(404).send();
  });
};
