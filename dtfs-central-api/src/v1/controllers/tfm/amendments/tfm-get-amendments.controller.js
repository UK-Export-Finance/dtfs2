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
    return amendment[0]?.amendments ?? [];
  } catch (err) {
    console.error('Unable to find amendments object %O', { err });
    return null;
  }
};

exports.getAllAmendmentsByFacilityId = async (req, res) => {
  const { facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAllAmendmentsByFacilityId(facilityId);
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
  const { facilityId, amendmentId } = req.params;
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
 * returns an object containing all properties of an amendment based on dealId:
 * {
 *   "amendmentId": "62692866ce546902bfcd9168",
 *   "createdAt": 1651058790,
 *   "updatedAt": 1651059653,
 *   "status": "In progress",
  * }
*/

const findAmendmentByDealId = async (dealId) => {
  try {
    const collection = await db.getCollection('tfm-facilities');
    const amendment = await collection.aggregate([
      { $match: { 'facilitySnapshot.dealId': ObjectId(dealId) } },
      { $project: { _id: 0, amendments: 1 } }
    ]).toArray();
    // returns the amendment object for the given dealId
    return amendment[0]?.amendments || null;
  } catch (err) {
    console.error('Unable to find the amendments object by deal Id %O', { err });
    return null;
  }
};
exports.findAmendmentByDealId = findAmendmentByDealId;

// get an amendment object based on a given dealId
exports.getAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  if (ObjectId.isValid(dealId)) {
    const amendment = await findAmendmentByDealId(dealId);
    if (amendment) {
      return res.status(200).send(amendment);
    }
    return res.status(404).send({ status: 404, message: 'The current deal doesn\'t have any amendments' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid deal Id' });
};

/**
 *  returns an object containing an amendment that's `in progress` or `completed` based on a given facilityId:
 *  {
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "In progress",
 *  }
 */

const findAmendmentByStatusAndFacilityId = async (facilityId, status) => {
  if (ObjectId.isValid(facilityId)) {
    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { _id: ObjectId(facilityId) } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': status, } },
        { $project: { _id: 0, amendments: 1 } },
      ]).toArray();
      // returns the amendment object for the given facilityId
      return amendment[0]?.amendments || [];
    } catch (err) {
      console.error('Unable to find amendments object %O', { err });
      return [];
    }
  }
  console.error('Invalid facility Id');
  return [];
};
exports.findAmendmentByStatusAndFacilityId = findAmendmentByStatusAndFacilityId;

exports.getAmendmentInProgress = async (req, res) => {
  const { facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};

exports.getAllCompletedAmendmentsByFacilityId = async (req, res) => {
  const { facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};

/**
 *  returns an object containing an amendment that's `in progress` or `completed` based on a given dealId:
 *  {
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "In progress",
 *  }
 */

const findAmendmentByStatusAndDealId = async (dealId, status) => {
  if (ObjectId.isValid(dealId)) {
    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { 'facilitySnapshot.dealId': ObjectId(dealId) } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': status, } },
        {
          $project: {
            _id: 0, amendments: 1, type: '$facilitySnapshot.type', ukefFacilityId: '$facilitySnapshot.ukefFacilityId'
          }
        },
      ]).toArray();
      // returns the amendment object for the given dealId
      return { amendments: amendment[0]?.amendments, type: amendment[0]?.type, ukefFacilityId: amendment[0]?.ukefFacilityId } ?? [];
    } catch (err) {
      console.error('Unable to find the amendments object %O', { err });
      return [];
    }
  }
  console.error('Invalid deal Id');
  return [];
};
exports.findAmendmentByStatusAndDealId = findAmendmentByStatusAndDealId;

exports.getAmendmentInProgressByDealId = async (req, res) => {
  const { dealId } = req.params;
  if (ObjectId.isValid(dealId)) {
    const amendment = await findAmendmentByStatusAndDealId(dealId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS);
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid deal Id' });
};

exports.getCompletedAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  if (ObjectId.isValid(dealId)) {
    const amendment = await findAmendmentByStatusAndDealId(dealId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid deal Id' });
};

/**
 *  returns an object containing the latest completed amendment based on a given facilityId:
 *  {
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "Completed",
 *  }
 */
const findLatestCompletedAmendment = async (facilityId) => {
  if (ObjectId.isValid(facilityId)) {
    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { _id: ObjectId(facilityId) } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED } },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: 0, amendments: 1 } },
        { $limit: 1 }
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
  const { facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findLatestCompletedAmendment(facilityId) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};

/**
 *  returns an object containing the latest completed amendment based on a given dealId:
 *  {
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "Completed",
 *  }
 */
const findLatestCompletedAmendmentByDealId = async (dealId) => {
  if (ObjectId.isValid(dealId)) {
    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { 'facilitySnapshot.dealId': ObjectId(dealId) } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED } },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: 0, amendments: 1 } },
        { $limit: 1 }
      ]).toArray();
      return amendment[0]?.amendments ?? [];
    } catch (err) {
      console.error('Unable to find amendments object %O', { err });
      return null;
    }
  }
  return null;
};
exports.findLatestCompletedAmendmentByDealId = findLatestCompletedAmendmentByDealId;

exports.getLatestCompletedAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  if (ObjectId.isValid(dealId)) {
    const amendment = await findLatestCompletedAmendmentByDealId(dealId) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};
