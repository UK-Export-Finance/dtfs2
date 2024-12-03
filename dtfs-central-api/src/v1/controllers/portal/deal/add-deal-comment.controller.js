const { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const { findOneDeal } = require('./get-deal.controller');

const addDealComment = async (_id, commentType, comment, auditDetails) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  if (!ObjectId.isValid(_id)) {
    return { status: 400, message: 'Invalid Deal Id' };
  }

  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(_id) } },
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
      $set: {
        auditRecord,
      },
    },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

exports.addDealCommentPost = async (req, res) => {
  const {
    params: { id: dealId },
    body: { commentType, comment, auditDetails },
  } = req;

  if (!ObjectId.isValid(dealId)) {
    res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  return findOneDeal(dealId, async (deal) => {
    if (!deal) {
      return res.status(404).send({ status: 400, message: 'Deal not found' });
    }

    const updatedDeal = await addDealComment(dealId, commentType, comment, auditDetails);

    return res.status(200).json(updatedDeal);
  });
};
