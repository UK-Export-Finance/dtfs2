import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuditDetails, MONGO_DB_COLLECTIONS, InvalidAuditDetailsError, DocumentNotDeletedError } from '@ukef/dtfs2-common';
import { deleteMany, deleteOne, validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { findOneDeal } from './tfm-get-deal.controller';
import { mongoDbClient } from '../../../../drivers/db-client';
import { CustomExpressRequest } from '../../../../types/custom-express-request';

export const deleteDeal = async (req: CustomExpressRequest<{ reqBody: { auditDetails: AuditDetails } }>, res: Response) => {
  const { id } = req.params;
  const { auditDetails } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  const deal = await findOneDeal(id);

  if (!deal) {
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  }

  try {
    await deleteOne({
      documentId: new ObjectId(id),
      collectionName: MONGO_DB_COLLECTIONS.TFM_DEALS,
      db: mongoDbClient,
      auditDetails,
    });
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(404).send({ status: 404, message: 'Deal not found' });
    }
    console.error('Error deleting deals');
    return res.status(500).send({ status: 500, error });
  }

  try {
    await deleteMany({
      filter: { 'facilitySnapshot.dealId': { $eq: deal._id } },
      collectionName: MONGO_DB_COLLECTIONS.TFM_FACILITIES,
      db: mongoDbClient,
      auditDetails,
    });

    return res.status(200).send({ acknowledged: true, deletedCount: 1 });
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(200).send({ acknowledged: true, deletedCount: 1 });
    }
    console.error('Error deleting facilities on deal');
    return res.status(500).send({ status: 500, error });
  }
};
