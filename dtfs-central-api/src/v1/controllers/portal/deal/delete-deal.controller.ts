import { deleteOne, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { InvalidAuditDetailsError, AuditDetails, MONGO_DB_COLLECTIONS, DocumentNotDeletedError, ApiErrorResponseBody } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { findOneDeal } from './get-deal.controller';
import { mongoDbClient as db } from '../../../../drivers/db-client';
import { CustomExpressRequest } from '../../../../types/custom-express-request';

export const deleteDeal = async (
  req: CustomExpressRequest<{ params: { id: string }; reqBody: { auditDetails: AuditDetails } }>,
  res: Response<ApiErrorResponseBody>,
) => {
  const { id } = req.params;
  const { auditDetails } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const deal = (await findOneDeal(id)) as object;

  if (!deal) {
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  try {
    validateAuditDetailsAndUserType(auditDetails, 'portal');

    await deleteOne({
      documentId: new ObjectId(id),
      collectionName: MONGO_DB_COLLECTIONS.DEALS,
      db,
      auditDetails,
    });

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }
    if (error instanceof DocumentNotDeletedError) {
      return res.sendStatus(404);
    }
    return res.status(500).send({ status: 500, message: 'An unknown error occurred' });
  }
};
