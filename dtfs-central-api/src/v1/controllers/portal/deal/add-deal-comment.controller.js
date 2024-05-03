const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client').default;
const { findOneDeal } = require('./get-deal.controller');

const addDealComment = async (_id, commentType, comment) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  if (ObjectId.isValid(_id)) {
    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(_id) } },
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
      { returnNewDocument: true, returnDocument: 'after' }
    );

    const { value } = findAndUpdateResponse;

    return value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.addDealComment = addDealComment;

exports.addDealCommentPost = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const dealId = req.params.id;

    await findOneDeal(dealId, async (deal) => {
      if (!deal) res.status(404).send({ status: 400, message: 'Deal not found' });

      if (deal) {
        const { commentType, comment } = req.body;

        const updatedDeal = await addDealComment(dealId, commentType, comment);

        res.status(200).json(updatedDeal);
      }
    });
  } else {
    res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
};
