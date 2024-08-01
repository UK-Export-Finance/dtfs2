const { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./get-deal.controller');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

const updateDealStatus = async ({ dealId, status, existingDeal, auditDetails }) => {
  const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const previousStatus = existingDeal.status;

  const modifiedDeal = {
    ...existingDeal,
    updatedAt: Date.now(),
    status,
    previousStatus,
  };
  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);
  const { _id, ...modifiedDealWithoutId } = modifiedDeal;
  const findAndUpdateResponse = await dealsCollection.findOneAndUpdate(
    { _id: { $eq: ObjectId(dealId) } },
    $.flatten({ ...modifiedDealWithoutId, auditRecord }),
    {
      returnNewDocument: true,
      returnDocument: 'after',
    },
  );

  console.info('Updated Portal BSS deal status from %s to %s', previousStatus, status);

  return findAndUpdateResponse.value;
};

exports.updateDealStatusPut = async (req, res) => {
  const {
    params: { id: dealId },
    body: { status, auditDetails },
  } = req;

  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails: ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  return await findOneDeal(dealId, async (existingDeal) => {
    if (existingDeal) {
      if (existingDeal.status === status) {
        return res.status(400).send();
      }
      const updatedDeal = await updateDealStatus({ dealId, status, existingDeal, auditDetails });
      return res.status(200).json(updatedDeal);
    }
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  });
};
