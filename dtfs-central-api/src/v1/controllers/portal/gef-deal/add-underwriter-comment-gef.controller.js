import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { findOneDeal } from './get-gef-deal.controller';
import { mongoDbClient as db } from '../../../../drivers/db-client';

export const addComment = async (_id, commentType, comment) => {
  if (ObjectId.isValid(_id)) {
    // get the deals collection
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

    // add the comment to the matching deal (based on _id)
    const addCommentToGefDeal = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(String(_id)) } },
      {
        $push: {
          [commentType]: {
            $each: [
              {
                ...comment,
                timestamp: Date.now(),
              },
            ],
            $position: 0,
          },
        },
      },
    );

    const { value } = addCommentToGefDeal;

    return value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};

export const addUnderwriterCommentToGefDeal = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
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
  } else {
    res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
};
