import { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { findOneDeal } from './get-gef-deal.controller';
import { mongoDbClient as db } from '../../../../drivers/db-client';
import { isNumber } from '../../../../helpers';

export const updateDeal = async ({ dealId, dealUpdate, auditDetails }) => {
  try {
    if (!ObjectId.isValid(dealId)) {
      return { status: 400, message: 'Invalid Deal Id' };
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

export const updateDealPut = async (req, res) => {
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
        const response = await updateDeal({ dealId, dealUpdate, auditDetails });
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
