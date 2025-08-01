const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { MONGO_DB_COLLECTIONS, InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');
const { findOneDeal } = require('../deal/get-deal.controller');
const { updateBssEwcsDeal } = require('../deal/update-deal.controller');
const { isNumber } = require('../../../../helpers');

const createFacilities = async (facilities, dealId, auditDetails) => {
  try {
    if (!ObjectId.isValid(dealId)) {
      return { status: 400, message: 'Invalid Deal Id' };
    }

    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);

    const auditRecord = generateAuditDatabaseRecordFromAuditDetails(auditDetails);

    const facilitiesWithId = facilities.map((f) => {
      const facility = f;

      facility._id = new ObjectId(facility._id);
      facility.createdDate = Date.now();
      facility.updatedAt = Date.now();
      facility.dealId = new ObjectId(dealId);
      facility.auditRecord = auditRecord;
      return facility;
    });

    const idsArray = [];
    facilitiesWithId.forEach((f) => {
      idsArray.push(f._id.toHexString());
    });

    const result = await collection.insertMany(facilitiesWithId);

    const dealUpdate = {
      facilities: idsArray,
    };

    const response = await updateBssEwcsDeal({ dealId, dealUpdate, auditDetails });

    const status = isNumber(response?.status, 3);

    if (status) {
      throw new Error({
        status: response.status,
        error: response.message,
      });
    }

    const flattenedIds = Object.values(result.insertedIds);

    return flattenedIds;
  } catch (error) {
    console.error('Unable to create the facility for deal %s %o', dealId, error);
    return { status: 500, message: error };
  }
};

exports.createMultipleFacilitiesPost = async (req, res) => {
  const { facilities, dealId, user, auditDetails } = req.body;

  if (!user) {
    return res.sendStatus(404);
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

  return findOneDeal(dealId, async (deal) => {
    if (!deal) {
      return res.status(404).send('Deal not found');
    }
    const response = await createFacilities(facilities, dealId, auditDetails);
    const status = isNumber(response?.status, 3);
    const code = status ? response.status : 200;

    return res.status(code).send(response);
  });
};
