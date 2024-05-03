import { deleteDocumentWithAuditLogs, generateNoUserLoggedInAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { findOneDeal } from './get-deal.controller';
import db from '../../../../drivers/db-client';

export const deleteDeal = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
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
      auditDetails: generateNoUserLoggedInAuditDetails(), // TODO!
    });

    return res.status(200).send();
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
  const status = await collection.deleteOne({ _id: { $eq: new ObjectId(id) } });
  return res.status(200).send(status);
};
