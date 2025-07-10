const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails, now } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-gef-deal.controller');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const { isNumber } = require('../../../../helpers');

/**
 * Updates a Gef deal in the database.
 * @param {Object} params - The parameters for updating the deal.
 * @param {string} params.dealId - The ID of the deal being updated.
 * @param {Object} params.dealUpdate - The update to be made to the deal.
 * @param {import("@ukef/dtfs2-common").AuditDetails} params.auditDetails - The audit details for the update.
 * @returns {Promise<{ status: number, message: string }>} The updated deal object.
 */
const updateGefDeal = async ({ dealId, dealUpdate, auditDetails }) => {
  try {
    if (!ObjectId.isValid(dealId)) {
      return { status: 400, message: 'Invalid Deal Id' };
    }

    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
    const originalDeal = await findOneDeal(dealId);
    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);
    const update = dealUpdate || {};

    const dealUpdateForDatabase = {
      ...originalDeal,
      ...update,
      updatedAt: now(),
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
exports.updateGefDeal = updateGefDeal;

exports.updateDealPut = async (req, res) => {
  const {
    params: { id: dealId },
    body: { dealUpdate, auditDetails },
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
        message: error.message,
        code: error.code,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  try {
    return await findOneDeal(dealId, async (existingDeal) => {
      if (existingDeal) {
        const response = await updateGefDeal({ dealId, dealUpdate, auditDetails });
        const status = isNumber(response?.status, 3);
        const code = status ? response.status : 200;

        return res.status(code).json(response);
      }

      return res.status(404).send();
    });
  } catch (error) {
    console.error('Unable to update deal %o', error);
    return res.status(500).send({ status: 500, message: error });
  }
};
