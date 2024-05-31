import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { AuditDetails, MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { deleteMany, deleteOne, validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { findOneDeal } from './tfm-get-deal.controller';
import db from '../../../../drivers/db-client';
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
    const deleteResult = await deleteOne({
      documentId: new ObjectId(id),
      collectionName: MONGO_DB_COLLECTIONS.TFM_DEALS,
      db,
      auditDetails,
    });

    await deleteMany({
      filter: { 'facilitySnapshot.dealId': { $eq: deal._id } },
      collectionName: MONGO_DB_COLLECTIONS.TFM_FACILITIES,
      db,
      auditDetails,
    });

    return res.status(200).send(deleteResult);
  } catch (error) {
    return res.status(500).send({ status: 500, error });
  }
};
