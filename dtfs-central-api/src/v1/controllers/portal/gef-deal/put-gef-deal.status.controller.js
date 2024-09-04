import { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { findOneDeal } from './get-gef-deal.controller';
import { mongoDbClient as db } from '../../../../drivers/db-client';

const updateDealStatus = async ({ dealId, previousStatus, newStatus, auditDetails }) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const dealUpdate = {
    previousStatus,
    status: newStatus,
    updatedAt: Date.now(),
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(dealId)) } },
    { $set: { ...dealUpdate, auditRecord } },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  console.info('Updated Portal GEF deal status from %s to %s', previousStatus, newStatus);

  return findAndUpdateResponse.value;
};

export const updateDealStatusPut = async (req, res) => {
  const {
    params: { id: dealId },
    body: { status: newStatus, auditDetails },
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

  return await findOneDeal(dealId, async (existingDeal) => {
    if (existingDeal) {
      if (existingDeal.status === newStatus) {
        return res.status(400).send();
      }

      const updatedDeal = await updateDealStatus({ dealId, previousStatus: existingDeal.status, newStatus, auditDetails });
      return res.status(200).json(updatedDeal);
    }

    return res.status(404).send({ status: 404, message: 'Deal not found' });
  });
};
