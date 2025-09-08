import {
  CustomExpressRequest,
  ApiError,
  ApiErrorResponseBody,
  AuditDetails,
  DocumentNotDeletedError,
  InvalidFacilityIdError,
  MONGO_DB_COLLECTIONS,
} from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { deleteOne, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { findOneFacility } from './get-facility.controller';
import { removeFacilityIdFromDeal } from '../deal/update-deal.controller';
import { mongoDbClient as db } from '../../../../drivers/db-client';

export const deleteFacility = async (
  req: CustomExpressRequest<{ params: { id: string }; reqBody: { auditDetails: AuditDetails; user: object } }>,
  res: Response<ApiErrorResponseBody>,
) => {
  const { id: facilityId } = req.params;
  const { auditDetails, user } = req.body;

  try {
    if (!ObjectId.isValid(facilityId)) {
      throw new InvalidFacilityIdError(facilityId);
    }

    validateAuditDetailsAndUserType(auditDetails, 'portal');

    const facility = await findOneFacility(facilityId);

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

    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }

    console.error(`Error whilst deleting facility, ${JSON.stringify(error)}`);

    return res.status(500).send({ status: 500, message: 'An unknown error occurred' });
  }
};
