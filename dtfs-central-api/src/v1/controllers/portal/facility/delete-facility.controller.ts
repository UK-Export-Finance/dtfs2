import { AuditDetails, DocumentNotDeletedError, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { deleteOne, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { findOneFacility } from './get-facility.controller';
import { removeFacilityIdFromDeal } from '../deal/update-deal.controller';
import { mongoDbClient as db } from '../../../../drivers/db-client';

export const deleteFacility = async (
  req: CustomExpressRequest<{ params: { id: string }; reqBody: { auditDetails: AuditDetails; user: object } }>,
  res: Response,
) => {
  const { id: facilityId } = req.params;
  const { auditDetails, user } = req.body;

  if (!ObjectId.isValid(facilityId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }

  try {
    validateAuditDetailsAndUserType(auditDetails, 'portal');
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return res.status(400).send({
        status: 400,
        message: `Invalid auditDetails: ${error.message.toString()}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  const facility = await findOneFacility(facilityId);

  if (!facility) {
    return res.status(404).send({ status: 400, message: 'Facility not found' });
  }

  if (!('dealId' in facility)) {
    return res.status(500).send({ status: 500, message: 'Facility object missing dealId' });
  }

  try {
    await deleteOne({
      documentId: new ObjectId(facilityId),
      collectionName: MONGO_DB_COLLECTIONS.FACILITIES,
      db,
      auditDetails,
    });

    await removeFacilityIdFromDeal(facility.dealId, facilityId, user, req.routePath, auditDetails);
    return res.status(200).send();
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.status(404).send({ status: 400, message: 'Facility not found' });
    }
    return res.status(500).send({ status: 500, error });
  }
};
