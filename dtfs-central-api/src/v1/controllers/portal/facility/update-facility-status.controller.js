import { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import $ from 'mongo-dot-notation';
import { findOneFacility } from './get-facility.controller';
import { mongoDbClient as db } from '../../../../drivers/db-client';

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

export const updateFacilityStatus = async ({ facilityId, status, existingFacility, auditDetails }) => {
  if (ObjectId.isValid(facilityId)) {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

    console.info('Updating Portal facility status to %s', status);
    const previousStatus = existingFacility.status;

    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const update = {
      ...existingFacility,
      updatedAt: Date.now(),
      previousStatus,
      status,
      auditRecord,
    };

    const findAndUpdateResponse = await collection.findOneAndUpdate({ _id: { $eq: ObjectId(facilityId) } }, $.flatten(withoutId(update)), {
      returnNewDocument: true,
      returnDocument: 'after',
    });

    console.info('Updated Portal facility status from %s to %s', previousStatus, status);

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Facility Id' };
};

export const updateFacilityStatusPut = async (req, res) => {
  const {
    body: { status, auditDetails },
    params: { id: facilityId },
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
    return res.status(500).send({ status: 500, error });
  }

  return await findOneFacility(facilityId, async (existingFacility) => {
    if (existingFacility) {
      const updatedFacility = await updateFacilityStatus({ facilityId, status, existingFacility, auditDetails });
      return res.status(200).json(updatedFacility);
    }

    return res.status(404).send();
  });
};
