import { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import $ from 'mongo-dot-notation';
import { findOneFacility } from './get-facility.controller';
import { updateDealEditedByPortal } from '../deal/update-deal.controller';
import { mongoDbClient as db } from '../../../../drivers/db-client';
import { ROUTES } from '../../../../constants';

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

export const updateFacility = async ({ facilityId, facilityUpdate, dealId, user, routePath, auditDetails }) => {
  if (!ObjectId.isValid(dealId) || !ObjectId.isValid(facilityId)) {
    return { status: 400, message: 'Invalid Deal or Facility Id' };
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const update = { ...facilityUpdate, dealId: ObjectId(dealId), updatedAt: Date.now(), auditRecord };

  const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(facilityId) } }, $.flatten(withoutId(update)), {
    returnNewDocument: true,
    returnDocument: 'after',
  });

  const { value: updatedFacility } = findAndUpdateResponse;

  if (routePath === ROUTES.PORTAL_ROUTE && user) {
    // update the deal so that the user that has edited this facility,
    // is also marked as editing the associated deal

    await updateDealEditedByPortal({ dealId, user, auditDetails });
  }

  return updatedFacility;
};

export const updateFacilityPut = async (req, res) => {
  const {
    params: { id: facilityId },
    body: { user, facilityUpdate, auditDetails },
    routePath,
  } = req;

  if (!ObjectId.isValid(facilityId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
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
  }
  const facility = await findOneFacility(facilityId);

  if (!facility) {
    return res.status(404).send();
  }

  const { dealId } = facility;

  const updatedFacility = await updateFacility({ facilityId, facilityUpdate, dealId, user, routePath, auditDetails });

  return res.status(200).json(updatedFacility);
};
