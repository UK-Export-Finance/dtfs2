import { deleteOne, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { InvalidAuditDetailsError } from '@ukef/dtfs2-common/errors';
import { AuditDetails, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { findOneDeal } from './get-deal.controller';
import db from '../../../../drivers/db-client';
import { CustomExpressRequest } from '../../../../types/custom-express-request';

export const deleteDeal = async (req: CustomExpressRequest<{ params: { id: string }; reqBody: { auditDetails: AuditDetails } }>, res: Response) => {
  const { id } = req.params;
  const { auditDetails } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  try {
    validateAuditDetailsAndUserType(auditDetails, 'portal');
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  const deal = (await findOneDeal(id)) as object;

  if (!deal) {
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  try {
    await deleteOne({
      documentId: new ObjectId(id),
      collectionName: MONGO_DB_COLLECTIONS.DEALS,
      db,
      auditDetails,
    });

    return res.status(200).send();
  } catch (error) {
    return res.status(500).send({ status: 500, error });
  }
};
