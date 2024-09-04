import { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { mongoDbClient as db } from '../../../../drivers/db-client';
import getCreateFacilityErrors from '../../../validation/create-facility';
import { findOneDeal } from '../deal/get-deal.controller';
import { addFacilityIdToDeal } from '../deal/update-deal.controller';

const createFacility = async (facility, user, routePath, auditDetails) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

  const { dealId } = facility;
  const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

  const newFacility = {
    ...facility,
    dealId: new ObjectId(facility.dealId),
    createdDate: Date.now(),
    updatedAt: Date.now(),
    auditRecord,
  };

  const response = await collection.insertOne(newFacility);
  const { insertedId } = response;

  await addFacilityIdToDeal(dealId, insertedId, user, routePath, auditDetails);

  return { _id: insertedId };
};

export const createFacilityPost = async (req, res) => {
  const { facility, user, auditDetails } = req.body;

  if (!user) {
    return res.status(404).send();
  }

  if (typeof facility?.type !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid facility payload' });
  }

  const validationErrors = getCreateFacilityErrors(facility);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      validationErrors,
    });
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

  const deal = await findOneDeal(facility.dealId);

  if (!deal) {
    return res.status(404).send('Deal not found');
  }

  const createdFacility = await createFacility(facility, user, req.routePath, auditDetails);

  return res.status(200).send(createdFacility);
};
