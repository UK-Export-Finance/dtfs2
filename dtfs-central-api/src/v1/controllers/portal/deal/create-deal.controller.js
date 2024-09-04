import { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { InvalidAuditDetailsError, AUDIT_USER_TYPES, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../../../../drivers/db-client';
import DEFAULTS from '../../../defaults';
import getDealErrors from '../../../validation/create-deal';

const createDeal = async (deal, maker, auditDetails) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);

  const { details } = deal;

  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const newDeal = {
    ...DEFAULTS.DEAL,
    ...deal,
    updatedAt: Date.now(),
    maker,
    bank: maker && maker.bank,
    details: {
      ...DEFAULTS.DEAL.details,
      ...details,
      created: Date.now(),
    },
    facilities: DEFAULTS.DEAL.facilities,
    auditRecord,
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return {
      deal: newDeal,
      validationErrors,
    };
  }

  const response = await collection.insertOne(newDeal);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

export const createDealPost = async (req, res) => {
  const { user, deal, auditDetails } = req.body;

  if (!user) {
    return res.status(400).send({ status: 400, message: 'Invalid user' });
  }

  if (typeof deal?.dealType !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid deal type' });
  }
  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }

  const { validationErrors, _id } = await createDeal(deal, user, auditDetails);

  if (validationErrors) {
    return res.status(400).send({
      _id,
      validationErrors,
    });
  }

  return res.status(200).send({ _id });
};
