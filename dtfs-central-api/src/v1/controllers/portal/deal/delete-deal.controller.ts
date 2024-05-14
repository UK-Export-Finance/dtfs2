import { deleteDocumentWithAuditLogs, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { AuditDetails, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { findOneDeal } from './get-deal.controller';
import db from '../../../../drivers/db-client';
import { CustomExpressRequest } from '../../../../types/custom-express-request';

export const deleteDeal = async (
  req: CustomExpressRequest<{ params: { id: string }; reqBody: { auditDetails: AuditDetails } }>,
  res: Response,
) => {
  const { id } = req.params;
  const { auditDetails } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  try {
    validateAuditDetailsAndUserType(auditDetails, 'portal');
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return res.status(400).send({
        status: 400,
        message: `Invalid auditDetails, ${error.message.toString()}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  const deal = (await findOneDeal(id)) as object;

  if (!deal) {
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    await deleteDocumentWithAuditLogs({
      documentId: new ObjectId(id),
      collectionName: MONGO_DB_COLLECTIONS.DEALS,
      db,
      auditDetails,
    });

    return res.status(200).send();
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
  const status = await collection.deleteOne({ _id: { $eq: new ObjectId(id) } });
  return res.status(200).send(status);
};
