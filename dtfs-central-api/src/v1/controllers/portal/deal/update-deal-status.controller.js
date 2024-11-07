const { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, DealNotFoundError, InvalidParameterError, ApiError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-deal.controller');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

/**
 *
 * @param param0
 * @param {string} param0.dealId - the dealId
 * @param {import('@ukef/dtfs2-common').DealStatus} param0.newStatus - the updated status to set
 * @param {import('@ukef/dtfs2-common').AuditDetails} param0.auditDetails - the users audit details
 * @returns {Promise<('@ukef/dtfs2-common').Deal>}
 */
const updateDealStatus = async ({ dealId, status, auditDetails }) => {
  const existingDeal = await findOneDeal(dealId);

  if (!existingDeal) {
    throw new DealNotFoundError(dealId);
  }

  if (existingDeal.status === status) {
    throw new InvalidParameterError('status', status);
  }

  const previousStatus = existingDeal.status;

  const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const dealUpdate = {
    updatedAt: Date.now(),
    status,
    previousStatus,
  };

  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const findAndUpdateResponse = await dealsCollection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(dealId)) } },
    { $set: { ...dealUpdate, auditRecord } },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  console.info('Updated Portal BSS deal status from %s to %s', previousStatus, status);

  return findAndUpdateResponse.value;
};

exports.updateDealStatus = updateDealStatus;

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

    const updatedDeal = await updateDealStatus({ dealId, status, auditDetails });
    return res.status(200).json(updatedDeal);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
    return res.status(500).send({ status: 500, error });
  }
};
