const { generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const { findOneDeal } = require('./get-gef-deal.controller');

// TODO - unit test
const updateDeal = async ({ dealId, dealUpdate, auditDetails }) => {
  try {
    if (!ObjectId.isValid(dealId)) {
      return { status: 400, message: 'Unable to update deal - Invalid Deal Id' };
    }

    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
    const originalDeal = await findOneDeal(dealId);
    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const dealUpdateForDatabase = {
      ...originalDeal,
      ...dealUpdate,
      updatedAt: Date.now(),
      auditRecord,
    };

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(String(dealId)) } },
      { $set: dealUpdateForDatabase },
      { returnNewDocument: true, returnDocument: 'after' },
    );

    return findAndUpdateResponse.value;
  } catch (error) {
    console.error('Unable to update deal %s %o', dealId, error);
    return { status: 500, message: error };
  }
};

module.exports = { updateDeal };
