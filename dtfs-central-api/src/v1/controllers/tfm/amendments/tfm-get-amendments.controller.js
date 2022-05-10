const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');

/* returns an array of object containing all properties for a given facilityId:
 * [{
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "In progress",
 * }]
 */
const findAllAmendmentsByFacilityId = async (facilityId) => {
  try {
    const collection = await db.getCollection('tfm-facilities');
    const amendment = await collection.aggregate([
      { $match: { _id: ObjectId(facilityId) } },
      { $project: { _id: 0, amendments: '$amendments' } },
    ]).toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0]?.amendments;
  } catch (err) {
    console.error('Unable to find amendments object %O', { err });
    return null;
  }
};

exports.getAllAmendmentsByFacilityId = async (req, res) => {
  const { id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAllAmendmentsByFacilityId(facilityId) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};

/**
 * returns an object containing all properties for a given amendmentId:
 * {
 *   "amendmentId": "62692866ce546902bfcd9168",
 *   "createdAt": 1651058790,
 *   "updatedAt": 1651059653,
 *   "status": "In progress",
  * }
*/

const findAmendmentById = async (facilityId, amendmentId) => {
  try {
    const collection = await db.getCollection('tfm-facilities');
    const amendment = await collection.aggregate([
      { $match: { _id: ObjectId(facilityId), 'amendments.amendmentId': ObjectId(amendmentId) } },
      {
        $project: {
          _id: 0,
          amendments: {
            $filter: {
              input: '$amendments',
              as: 'amendment',
              cond: { $eq: ['$$amendment.amendmentId', ObjectId(amendmentId)] },
            },
          },
        },
      },
      { $unwind: '$amendments' },
    ]).toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0]?.amendments || null;
  } catch (err) {
    console.error('Unable to find amendments object %O', { err });
    return null;
  }
};
exports.findAmendmentById = findAmendmentById;

// get an amendment object based on a given facilityId and amendmentId
exports.getAmendmentById = async (req, res) => {
  const { id: facilityId, amendmentId } = req.params;
  if (ObjectId.isValid(facilityId) && ObjectId.isValid(amendmentId)) {
    const amendment = await findAmendmentById(facilityId, amendmentId);
    if (amendment) {
      return res.status(200).send(amendment);
    }
    return res.status(404).send({ status: 404, message: 'The current facility doesn\'t have the specified amendment' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility or amendment Id' });
};

/**
 *  returns an object containing an amendment that's in progress based on a given facilityId:
 *  {
 *     "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "In progress",
 *  }
 */

const findAmendmentStatus = async (facilityId, status) => {
  if (ObjectId.isValid(facilityId)) {
    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { _id: ObjectId(facilityId), 'amendments.status': status } },
        {
          $project: {
            _id: 0,
            amendments: {
              $filter: {
                input: '$amendments',
                as: 'amendment',
                cond: { $eq: ['$$amendment.status', status] },
              },
            },
          },
        },
      ]).toArray();
      // returns the amendment object for the given facilityId
      return amendment[0]?.amendments || null;
    } catch (err) {
      console.error('Unable to find amendments object %O', { err });
      return null;
    }
  }
  return null;
};
exports.findAmendmentStatus = findAmendmentStatus;

exports.getAmendmentInProgress = async (req, res) => {
  const { id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAmendmentStatus(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS) || [];
    const response = amendment[0] ?? [];
    return res.status(200).send(response);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};

exports.getAllCompletedAmendments = async (req, res) => {
  const { id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAmendmentStatus(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};

/**
 *  returns an object containing the latest completed amendment based on a given facilityId:
 *  {
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "In progress",
 *  }
 */
const findLatestCompletedAmendment = async (facilityId) => {
  if (ObjectId.isValid(facilityId)) {
    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { _id: ObjectId(facilityId), 'amendments.status': CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED } },
        { $unwind: '$amendments' },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: 0, amendments: 1 } },
        { $limit: 1 },
      ]).toArray();
      return amendment[0]?.amendments || null;
    } catch (err) {
      console.error('Unable to find amendments object %O', { err });
      return null;
    }
  }
  return null;
};
exports.findLatestCompletedAmendment = findLatestCompletedAmendment;

exports.getLatestCompletedAmendment = async (req, res) => {
  const { id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findLatestCompletedAmendment(facilityId) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};
