const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('../deal/get-deal.controller');
const { updateDeal } = require('../deal/update-deal.controller');
const { isNumber } = require('../../../../helpers');
const { DB_COLLECTIONS } = require('../../../../constants');
const { generatePortalUserAuditDetails } = require('../../../../helpers/generateAuditDetails');

const createFacilities = async (facilities, dealId, userId) => {
  try {
    if (!ObjectId.isValid(dealId)) {
      return { status: 400, message: 'Invalid Deal Id' };
    }

    const collection = await db.getCollection(DB_COLLECTIONS.FACILITIES);
    const auditDetails = generatePortalUserAuditDetails(userId);

    const facilitiesWithId = await Promise.all(facilities.map(async (f) => {
      const facility = f;

      facility._id = new ObjectId(facility._id);
      facility.createdDate = Date.now();
      facility.updatedAt = Date.now();
      facility.dealId = new ObjectId(dealId);
      facility.auditDetails = auditDetails;
      return facility;
    }));

    const idsArray = [];
    facilitiesWithId.forEach((f) => {
      idsArray.push(f._id.toHexString());
    });

    const result = await collection.insertMany(facilitiesWithId);

    const dealUpdate = {
      facilities: idsArray,
      auditDetails,
    };

    const response = await updateDeal(
      dealId,
      dealUpdate,
    );

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
    console.error('Unable to create the facility for deal %s %s', dealId, error);
    return { status: 500, message: error };
  }
};

exports.createMultipleFacilitiesPost = async (req, res) => {
  const {
    facilities,
    dealId,
    user,
  } = req.body;

  if (!user) {
    return res.status(404).send();
  }

  return findOneDeal(dealId, async (deal) => {
    if (deal) {
      const response = await createFacilities(facilities, dealId, user._id);
      const status = isNumber(response?.status, 3);
      const code = status ? response.status : 200;

      return res.status(code).send(response);
    }

    return res.status(404).send('Deal not found');
  });
};
