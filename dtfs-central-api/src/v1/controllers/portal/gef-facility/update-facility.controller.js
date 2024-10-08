const { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const {
  MONGO_DB_COLLECTIONS,
  InvalidAuditDetailsError,
  FacilityNotFoundError,
  InvalidDealIdError,
  InvalidFacilityIdError,
  ApiError,
} = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

const updateFacility = async ({ facilityId, facilityUpdate, auditDetails }) => {
  if (!ObjectId.isValid(facilityId)) {
    throw new InvalidFacilityIdError(facilityId);
  }

  try {
    const facilitiesCollection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
    const dealsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.DEALS);
    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const existingFacility = await facilitiesCollection.findOne({ _id: { $eq: ObjectId(facilityId) } });

    if (!existingFacility) {
      throw new FacilityNotFoundError(facilityId);
    }

    const { dealId } = existingFacility;

    if (dealId !== undefined && !ObjectId.isValid(dealId)) {
      throw new InvalidDealIdError(dealId);
    }

    const facilityUpdateWithAuditRecord = { ...facilityUpdate, auditRecord };

    const updatedFacilityResponse = await facilitiesCollection.findOneAndUpdate(
      { _id: { $eq: ObjectId(facilityId) } },
      { $set: facilityUpdateWithAuditRecord },
      { returnNewDocument: true, returnDocument: 'after' },
    );

    // update facilitiesUpdated timestamp in the deal
    const dealUpdateObj = { facilitiesUpdated: new Date().valueOf(), auditRecord };

    await dealsCollection.updateOne({ _id: { $eq: ObjectId(dealId) } }, { $set: dealUpdateObj });

    return updatedFacilityResponse;
  } catch (error) {
    console.error('Unable to update the facility %o', error);
    throw error;
  }
};
exports.updateFacility = updateFacility;

exports.updateFacilityPut = async (req, res) => {
  const {
    params: { id: facilityId },
    body: { facilityUpdate, auditDetails },
  } = req;

  try {
    if (!ObjectId.isValid(facilityId)) {
      throw new InvalidFacilityIdError(facilityId);
    }

    validateAuditDetails(auditDetails);

    const updatedFacility = await updateFacility({ facilityId, facilityUpdate, auditDetails });
    return res.status(200).json(updatedFacility);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }

    if (error instanceof ApiError) {
      return res.status(error.status).send({ status: error.status, message: error.message });
    }

    return res.status(500).send({ status: 500, error });
  }
};
