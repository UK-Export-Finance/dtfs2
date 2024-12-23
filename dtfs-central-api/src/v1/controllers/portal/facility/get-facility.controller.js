const { MONGO_DB_COLLECTIONS, InvalidFacilityIdError, ApiError, FacilityNotFoundError } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { mongoDbClient: db } = require('../../../../drivers/db-client');

/**
 * @param {string} facilityId - the facility Id
 * @returns {Promise<import('@ukef/dtfs2-common').Facility>} - returns the facility if it is found
 *
 * @throws {InvalidFacilityIdError} if the id is invalid
 * @throws {FacilityNotFoundError} if the id is valid but does not correspond to a facility
 */
const findOneFacility = async (facilityId) => {
  if (!ObjectId.isValid(facilityId)) {
    throw new InvalidFacilityIdError(facilityId);
  }

  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.FACILITIES);
  const facility = await collection.findOne({ _id: { $eq: ObjectId(facilityId) } });

  if (!facility) {
    throw new FacilityNotFoundError(facilityId);
  }

  return facility;
};
exports.findOneFacility = findOneFacility;

exports.findOneFacilityGet = async (req, res) => {
  const {
    params: { id: facilityId },
  } = req;
  try {
    const facility = await findOneFacility(facilityId);

    return res.status(200).send(facility);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
        code: error.code,
      });
    }

    console.error(`Error whilst getting facility, ${error}`);

    return res.status(500).send({ status: 500, message: 'An unknown error occurred' });
  }
};
