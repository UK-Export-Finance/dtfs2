const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');

/* returns an array of object containing all amendments in progress
 * [{
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "In progress",
 * }]
 */
const findAllAmendmentsByStatus = async (status) => {
  try {
    const collection = await db.getCollection('tfm-facilities');
    const amendment = await collection.aggregate([
      { $project: { _id: 0, amendments: '$amendments' } },
      { $unwind: '$amendments' },
      { $match: { 'amendments.status': status } },
      { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
      { $project: { _id: 0, amendments: 1 } },
    ]).toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0]?.amendments ?? null;
  } catch (err) {
    console.error('Unable to find amendments object %O', { err });
    return null;
  }
};

exports.getAllAmendmentsInProgress = async (req, res) => {
  const amendment = await findAllAmendmentsByStatus(CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS) ?? [];

  return res.status(200).send(amendment);
};

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
      { $unwind: '$amendments' },
      { $sort: { 'amendments.version': -1 } },
      { $match: { 'amendments.status': { $ne: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.NOT_STARTED } } },
      { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
      { $project: { _id: 0, amendments: 1 } },
    ]).toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0]?.amendments ?? null;
  } catch (err) {
    console.error('Unable to find amendments object %O', { err });
    return null;
  }
};

exports.getAllAmendmentsByFacilityId = async (req, res) => {
  const { facilityId } = req.params;
  const { status, type } = req.query;
  
  if (ObjectId.isValid(facilityId)) {
    let amendment;
    if (status === 'in-progress') {
      let amendments = await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS) ?? [];
      amendment = amendments[0] ?? {};
    } else if (status === 'completed') {
      if (type === 'latest-value') {
        amendment = await findLatestCompletedValueAmendmentByFacilityId(facilityId) ?? {};
      } else if (type === 'latest-cover-end-date') {
        amendment = await findLatestCompletedDateAmendmentByFacilityId(facilityId) ?? {};
      } else {
        amendment = await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED) ?? [];
      }
    } else {
      amendment = await findAllAmendmentsByFacilityId(facilityId) ?? [];
    }
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
        $addFields: {
          'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId'
        }
      },
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
    return amendment[0]?.amendments ?? null;
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
    const amendment = await findAmendmentById(facilityId, amendmentId) ?? {};
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility or amendment Id' });
};

/**
 * returns an object containing all amendments based on dealId:
 * {
 *   "amendmentId": "62692866ce546902bfcd9168",
 *   "createdAt": 1651058790,
 *   "updatedAt": 1651059653,
 *   "status": "In progress",
  * }
*/

const findAmendmentsByDealId = async (dealId) => {
  try {
    const collection = await db.getCollection('tfm-facilities');
    const amendment = await collection.aggregate([
      { $match: { 'facilitySnapshot.dealId': ObjectId(dealId) } },
      {
        $addFields: {
          'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId'
        }
      },
      { $project: { _id: 0, amendments: 1 } },
      { $unwind: '$amendments' },
      { $sort: { 'amendments.submittedAt': -1 } },
      { $match: { 'amendments.status': { $ne: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.NOT_STARTED }, 'amendments.submittedByPim': true } },
      { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
      { $project: { _id: 0, amendments: 1 } },
    ]).toArray();
    // returns the amendment object for the given dealId
    return amendment[0]?.amendments ?? null;
  } catch (err) {
    console.error('Unable to find the amendments object by deal Id %O', { err });
    return null;
  }
};
exports.findAmendmentByDealId = findAmendmentsByDealId;

exports.getAmendmentsByDealId = async (req, res) => {
  const { dealId } = req.params;
  if (ObjectId.isValid(dealId)) {
    const amendment = await findAmendmentsByDealId(dealId) ?? [];
    return res.status(200).send(amendment);
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
        { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
        { $project: { _id: 0, amendments: 1 } },
      ]).toArray();
      // returns the amendment object for the given facilityId
      return amendment[0]?.amendments ?? null;
    } catch (err) {
      console.error('Unable to find amendments object %O', { err });
      return null;
    }
  }
  console.error('Invalid facility Id');
  return null;
};
exports.findAmendmentByStatusAndFacilityId = findAmendmentByStatusAndFacilityId;

// exports.getAmendmentInProgress = async (req, res) => {
//   const { facilityId } = req.params;
//   if (ObjectId.isValid(facilityId)) {
//     let amendment = await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS) ?? [];
//     amendment = amendment[0] ?? {};
//     return res.status(200).send(amendment);
//   }
//   return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
// };

// exports.getAllCompletedAmendmentsByFacilityId = async (req, res) => {
//   const { facilityId } = req.params;
//   if (ObjectId.isValid(facilityId)) {
//     const amendment = await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED) ?? [];
//     return res.status(200).send(amendment);
//   }
//   return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
// };

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
        {
          $addFields: {
            'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId'
          }
        },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': status } },
        { $project: { _id: 0, amendments: 1 } },
        { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
        { $project: { amendments: 1, type: 1, _id: 0, } },
      ]).toArray();

      // returns the amendment object for the given dealId
      return amendment[0]?.amendments ?? null;
    } catch (err) {
      console.error('Unable to find the amendments object %O', { err });
      return null;
    }
  }
  console.error('Invalid deal Id');
  return null;
};
exports.findAmendmentByStatusAndDealId = findAmendmentByStatusAndDealId;

exports.getAmendmentInProgressByDealId = async (req, res) => {
  const { dealId } = req.params;
  if (ObjectId.isValid(dealId)) {
    const amendment = await findAmendmentByStatusAndDealId(dealId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS) ?? [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid deal Id' });
};

exports.getCompletedAmendmentByDealId = async (req, res) => {
  const { dealId } = req.params;
  if (ObjectId.isValid(dealId)) {
    const amendment = await findAmendmentByStatusAndDealId(dealId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED) ?? [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid deal Id' });
};

/**
 *  returns an object containing the latest completed amendment value, currency and amendmentId based on a given facilityId:
 *  {
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "Completed",
 *  }
 */
const findLatestCompletedValueAmendmentByFacilityId = async (facilityId) => {
  if (ObjectId.isValid(facilityId)) {
    const { PROCEED } = CONSTANTS.AMENDMENT.AMENDMENT_BANK_DECISION;
    const { COMPLETED } = CONSTANTS.AMENDMENT.AMENDMENT_STATUS;
    const { APPROVED_WITH_CONDITIONS, APPROVED_WITHOUT_CONDITIONS } = CONSTANTS.AMENDMENT.AMENDMENT_MANAGER_DECISIONS;

    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { _id: ObjectId(facilityId) } },
        { $unwind: '$amendments' },
        {
          $match: {
            $or: [
              {
                'amendments.status': COMPLETED,
                'amendments.submittedByPim': true,
                'amendments.requireUkefApproval': false,
                'amendments.changeFacilityValue': true
              },
              {
                'amendments.status': COMPLETED,
                'amendments.bankDecision.decision': PROCEED,
                'amendments.bankDecision.submitted': true,
                'amendments.ukefDecision.value': APPROVED_WITH_CONDITIONS,
                'amendments.changeFacilityValue': true
              },
              {
                'amendments.status': COMPLETED,
                'amendments.bankDecision.decision': PROCEED,
                'amendments.bankDecision.submitted': true,
                'amendments.ukefDecision.value': APPROVED_WITHOUT_CONDITIONS,
                'amendments.changeFacilityValue': true
              }
            ]
          }
        },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: 0, amendments: 1 } },
        { $limit: 1 }
      ]).toArray();

      if (amendment[0]?.amendments?.value) {
        return {
          amendmentId: amendment[0].amendments.amendmentId,
          value: amendment[0].amendments.value,
          currency: amendment[0].amendments.currency
        };
      }
      return null;
    } catch (err) {
      console.error('Unable to find latest completed amendments value %O', { err });
      return null;
    }
  }
  return null;
};
exports.findLatestCompletedValueAmendmentByFacilityId = findLatestCompletedValueAmendmentByFacilityId;

/**
 *  returns an object containing the latest completed amendment coverEndDate and amendmentId based on a given facilityId:
 *  {
 *    "amendmentId": "62692866ce546902bfcd9168",
 *    "createdAt": 1651058790,
 *    "updatedAt": 1651059653,
 *    "status": "Completed",
 *  }
 */
const findLatestCompletedDateAmendmentByFacilityId = async (facilityId) => {
  if (ObjectId.isValid(facilityId)) {
    const { PROCEED } = CONSTANTS.AMENDMENT.AMENDMENT_BANK_DECISION;
    const { COMPLETED } = CONSTANTS.AMENDMENT.AMENDMENT_STATUS;
    const { APPROVED_WITH_CONDITIONS, APPROVED_WITHOUT_CONDITIONS } = CONSTANTS.AMENDMENT.AMENDMENT_MANAGER_DECISIONS;

    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { _id: ObjectId(facilityId) } },
        { $unwind: '$amendments' },
        {
          $match: {
            $or: [
              {
                'amendments.status': COMPLETED,
                'amendments.submittedByPim': true,
                'amendments.requireUkefApproval': false,
                'amendments.changeCoverEndDate': true
              },
              {
                'amendments.status': COMPLETED,
                'amendments.bankDecision.decision': PROCEED,
                'amendments.bankDecision.submitted': true,
                'amendments.ukefDecision.coverEndDate': APPROVED_WITH_CONDITIONS,
                'amendments.changeCoverEndDate': true
              },
              {
                'amendments.status': COMPLETED,
                'amendments.bankDecision.decision': PROCEED,
                'amendments.bankDecision.submitted': true,
                'amendments.ukefDecision.coverEndDate': APPROVED_WITHOUT_CONDITIONS,
                'amendments.changeCoverEndDate': true
              }
            ]
          }
        },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: 0, amendments: 1 } },
        { $limit: 1 }
      ]).toArray();

      if (amendment[0]?.amendments?.coverEndDate) {
        return {
          amendmentId: amendment[0].amendments.amendmentId,
          coverEndDate: amendment[0].amendments.coverEndDate
        };
      }
      return null;
    } catch (err) {
      console.error('Unable to find latest completed amendments coverEndDate %O', { err });
      return null;
    }
  }
  return null;
};
exports.findLatestCompletedDateAmendmentByFacilityId = findLatestCompletedDateAmendmentByFacilityId;

// finds the latest completed amendment and returns the version
const findLatestCompletedAmendmentByFacilityIdVersion = async (facilityId) => {
  if (ObjectId.isValid(facilityId)) {
    const { COMPLETED } = CONSTANTS.AMENDMENT.AMENDMENT_STATUS;

    try {
      const collection = await db.getCollection('tfm-facilities');
      const amendment = await collection.aggregate([
        { $match: { _id: ObjectId(facilityId) } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': COMPLETED } },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: 0, amendments: 1 } },
        { $limit: 1 }
      ]).toArray();
      return amendment[0]?.amendments?.version ?? null;
    } catch (err) {
      console.error('Unable to find amendments object %O', { err });
      return null;
    }
  }
  return null;
};
exports.findLatestCompletedAmendmentByFacilityIdVersion = findLatestCompletedAmendmentByFacilityIdVersion;

// exports.getLatestCompletedAmendmentValue = async (req, res) => {
//   const { facilityId } = req.params;
//   if (ObjectId.isValid(facilityId)) {
//     const newValue = await findLatestCompletedValueAmendmentByFacilityId(facilityId) ?? {};
//     return res.status(200).send(newValue);
//   }
//   return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
// };

// exports.getLatestCompletedAmendmentDate = async (req, res) => {
//   const { facilityId } = req.params;
//   if (ObjectId.isValid(facilityId)) {
//     const coverEndDate = await findLatestCompletedDateAmendmentByFacilityId(facilityId) ?? {};
//     return res.status(200).send(coverEndDate);
//   }
//   return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
// };

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
      return amendment[0]?.amendments ?? null;
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
    const amendment = await findLatestCompletedAmendmentByDealId(dealId) ?? {};
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};
