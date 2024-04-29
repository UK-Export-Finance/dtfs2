const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client').default;
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
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $project: { _id: false, amendments: '$amendments' } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': { $eq: status } } },
        { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
        { $project: { _id: false, amendments: true } },
      ])
      .toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0]?.amendments ?? null;
  } catch (error) {
    console.error('Unable to find amendments object %o', error);
    return null;
  }
};

exports.getAllAmendmentsInProgress = async (req, res) => {
  const amendment = (await findAllAmendmentsByStatus(CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS)) ?? [];

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
    if (!ObjectId.isValid(facilityId)) {
      throw new Error('Invalid facility Id');
    }
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { _id: { $eq: ObjectId(facilityId) } } },
        { $project: { _id: false, amendments: '$amendments' } },
        { $unwind: '$amendments' },
        { $sort: { 'amendments.version': -1 } },
        { $match: { 'amendments.status': { $ne: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.NOT_STARTED } } },
        { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
        { $project: { _id: false, amendments: true } },
      ])
      .toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0]?.amendments ?? null;
  } catch (error) {
    console.error('Unable to find amendments object %o', error);
    return null;
  }
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
  if (!ObjectId.isValid(facilityId)) {
    throw new Error('Invalid facility Id');
  }

  if (!ObjectId.isValid(amendmentId)) {
    throw new Error('Invalid amendment Id');
  }

  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { _id: { $eq: ObjectId(facilityId) }, 'amendments.amendmentId': { $eq: ObjectId(amendmentId) } } },
        {
          $addFields: {
            'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
          },
        },
        {
          $project: {
            _id: false,
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
      ])
      .toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0]?.amendments ?? null;
  } catch (error) {
    console.error('Unable to find amendments object %o', error);
    return null;
  }
};
exports.findAmendmentById = findAmendmentById;

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
  if (!ObjectId.isValid(dealId)) {
    throw new Error('Invalid Deal Id');
  }

  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { 'facilitySnapshot.dealId': { $eq: ObjectId(dealId) } } },
        {
          $addFields: {
            'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
          },
        },
        { $project: { _id: false, amendments: true } },
        { $unwind: '$amendments' },
        { $sort: { 'amendments.submittedAt': -1 } },
        { $match: { 'amendments.status': { $ne: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.NOT_STARTED }, 'amendments.submittedByPim': { $eq: true } } },
        { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
        { $project: { _id: false, amendments: true } },
      ])
      .toArray();
    // returns the amendment object for the given dealId
    return amendment[0]?.amendments ?? null;
  } catch (error) {
    console.error('Unable to find the amendments object by Deal Id %o', error);
    return null;
  }
};
exports.findAmendmentByDealId = findAmendmentsByDealId;

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
  if (!ObjectId.isValid(facilityId)) {
    console.error('Invalid facility Id');
    return null;
  }

  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { _id: { $eq: ObjectId(facilityId) } } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': { $eq: status } } },
        { $project: { _id: false, amendments: true } },
        { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },
        { $project: { _id: false, amendments: true } },
      ])
      .toArray();
    // returns the amendment object for the given facilityId
    return amendment[0]?.amendments ?? null;
  } catch (error) {
    console.error('Unable to find amendments object %o', error);
    return null;
  }
};
exports.findAmendmentByStatusAndFacilityId = findAmendmentByStatusAndFacilityId;

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
  if (!ObjectId.isValid(dealId)) {
    console.error('Invalid Deal Id');
    return null;
  }
  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { 'facilitySnapshot.dealId': { $eq: ObjectId(dealId) } } },
        {
          $addFields: {
            'amendments.ukefFacilityId': '$facilitySnapshot.ukefFacilityId',
          },
        },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': { $eq: status } } },
        { $project: { _id: false, amendments: true } },
        { $group: { _id: '$_id', amendments: { $push: '$amendments' } } },

        { $project: { amendments: true, type: true, _id: false } },
      ])
      .toArray();

    // returns the amendment object for the given dealId
    return amendment[0]?.amendments ?? null;
  } catch (error) {
    console.error('Unable to find the amendments object %o', error);
    return null;
  }
};
exports.findAmendmentByStatusAndDealId = findAmendmentByStatusAndDealId;

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
  if (!ObjectId.isValid(facilityId)) {
    console.error('Invalid facility Id');
    return null;
  }
  const { PROCEED } = CONSTANTS.AMENDMENT.AMENDMENT_BANK_DECISION;
  const { COMPLETED } = CONSTANTS.AMENDMENT.AMENDMENT_STATUS;
  const { APPROVED_WITH_CONDITIONS, APPROVED_WITHOUT_CONDITIONS } = CONSTANTS.AMENDMENT.AMENDMENT_MANAGER_DECISIONS;

  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { _id: { $eq: ObjectId(facilityId) } } },
        { $unwind: '$amendments' },
        {
          $match: {
            $or: [
              {
                'amendments.status': { $eq: COMPLETED },
                'amendments.submittedByPim': { $eq: true },
                'amendments.requireUkefApproval': { $eq: false },
                'amendments.changeFacilityValue': { $eq: true },
              },
              {
                'amendments.status': { $eq: COMPLETED },
                'amendments.bankDecision.decision': { $eq: PROCEED },
                'amendments.bankDecision.submitted': { $eq: true },
                'amendments.ukefDecision.value': { $eq: APPROVED_WITH_CONDITIONS },
                'amendments.changeFacilityValue': { $eq: true },
              },
              {
                'amendments.status': { $eq: COMPLETED },
                'amendments.bankDecision.decision': { $eq: PROCEED },
                'amendments.bankDecision.submitted': { $eq: true },
                'amendments.ukefDecision.value': { $eq: APPROVED_WITHOUT_CONDITIONS },
                'amendments.changeFacilityValue': { $eq: true },
              },
            ],
          },
        },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },

        { $project: { _id: false, amendments: true } },
        { $limit: 1 },
      ])
      .toArray();

    if (amendment[0]?.amendments?.value) {
      return {
        amendmentId: amendment[0].amendments.amendmentId,
        value: amendment[0].amendments.value,
        currency: amendment[0].amendments.currency,
      };
    }
    return null;
  } catch (error) {
    console.error('Unable to find latest completed amendments value %o', error);
    return null;
  }
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
  if (!ObjectId.isValid(facilityId)) {
    console.error('Invalid facility Id');
    return null;
  }
  const { PROCEED } = CONSTANTS.AMENDMENT.AMENDMENT_BANK_DECISION;
  const { COMPLETED } = CONSTANTS.AMENDMENT.AMENDMENT_STATUS;
  const { APPROVED_WITH_CONDITIONS, APPROVED_WITHOUT_CONDITIONS } = CONSTANTS.AMENDMENT.AMENDMENT_MANAGER_DECISIONS;

  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { _id: { $eq: ObjectId(facilityId) } } },
        { $unwind: '$amendments' },
        {
          $match: {
            $or: [
              {
                'amendments.status': { $eq: COMPLETED },
                'amendments.submittedByPim': { $eq: true },
                'amendments.requireUkefApproval': { $eq: false },
                'amendments.changeCoverEndDate': { $eq: true },
              },
              {
                'amendments.status': { $eq: COMPLETED },
                'amendments.bankDecision.decision': { $eq: PROCEED },
                'amendments.bankDecision.submitted': { $eq: true },
                'amendments.ukefDecision.coverEndDate': { $eq: APPROVED_WITH_CONDITIONS },
                'amendments.changeCoverEndDate': { $eq: true },
              },
              {
                'amendments.status': { $eq: COMPLETED },
                'amendments.bankDecision.decision': { $eq: PROCEED },
                'amendments.bankDecision.submitted': { $eq: true },
                'amendments.ukefDecision.coverEndDate': { $eq: APPROVED_WITHOUT_CONDITIONS },
                'amendments.changeCoverEndDate': { $eq: true },
              },
            ],
          },
        },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },

        { $project: { _id: false, amendments: true } },
        { $limit: 1 },
      ])
      .toArray();

    if (amendment[0]?.amendments?.coverEndDate) {
      return {
        amendmentId: amendment[0].amendments.amendmentId,
        coverEndDate: amendment[0].amendments.coverEndDate,
      };
    }
    return null;
  } catch (error) {
    console.error('Unable to find latest completed amendments coverEndDate %o', error);
    return null;
  }
};
exports.findLatestCompletedDateAmendmentByFacilityId = findLatestCompletedDateAmendmentByFacilityId;

// finds the latest completed amendment and returns the version
const findLatestCompletedAmendmentByFacilityIdVersion = async (facilityId) => {
  if (!ObjectId.isValid(facilityId)) {
    console.error('Invalid facility Id');
    return null;
  }
  const { COMPLETED } = CONSTANTS.AMENDMENT.AMENDMENT_STATUS;

  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { _id: { $eq: ObjectId(facilityId) } } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': { $eq: COMPLETED } } },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: false, amendments: true } },
        { $limit: 1 },
      ])
      .toArray();
    return amendment[0]?.amendments?.version ?? null;
  } catch (error) {
    console.error('Unable to find amendments object %o', error);
    return null;
  }
};

exports.findLatestCompletedAmendmentByFacilityIdVersion = findLatestCompletedAmendmentByFacilityIdVersion;

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
  if (!ObjectId.isValid(dealId)) {
    console.error('Invalid Deal Id');
    return null;
  }

  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    const amendment = await collection
      .aggregate([
        { $match: { 'facilitySnapshot.dealId': { $eq: ObjectId(dealId) } } },
        { $unwind: '$amendments' },
        { $match: { 'amendments.status': CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED } },
        { $sort: { 'amendments.updatedAt': -1, 'amendments.version': -1 } },
        { $project: { _id: false, amendments: true } },
        { $limit: 1 },
      ])
      .toArray();
    return amendment[0]?.amendments ?? null;
  } catch (error) {
    console.error('Unable to find amendments object %o', error);
    return null;
  }
};

exports.findLatestCompletedAmendmentByDealId = findLatestCompletedAmendmentByDealId;

exports.getAmendmentsByFacilityId = async (req, res) => {
  const { facilityId, amendmentIdOrStatus, type } = req.params;
  if (!ObjectId.isValid(facilityId)) {
    return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
  }

  let amendment;
  switch (amendmentIdOrStatus) {
    case CONSTANTS.AMENDMENT.AMENDMENT_QUERY_STATUSES.IN_PROGRESS: {
      const amendmentsInProgress = (await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS)) ?? [];
      amendment = amendmentsInProgress[0] ?? {};
      break;
    }
    case CONSTANTS.AMENDMENT.AMENDMENT_QUERY_STATUSES.COMPLETED:
      if (type === CONSTANTS.AMENDMENT.AMENDMENT_QUERIES.LATEST_VALUE) {
        amendment = (await findLatestCompletedValueAmendmentByFacilityId(facilityId)) ?? {};
      } else if (type === CONSTANTS.AMENDMENT.AMENDMENT_QUERIES.LATEST_COVER_END_DATE) {
        amendment = (await findLatestCompletedDateAmendmentByFacilityId(facilityId)) ?? {};
      } else {
        amendment = (await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED)) ?? [];
      }
      break;
    default:
      if (amendmentIdOrStatus) {
        if (!ObjectId.isValid(amendmentIdOrStatus)) {
          return res.status(400).send({ status: 400, message: 'Invalid amendment Id' });
        }
        amendment = (await findAmendmentById(facilityId, amendmentIdOrStatus)) ?? {};
      } else {
        amendment = (await findAllAmendmentsByFacilityId(facilityId)) ?? [];
      }
  }
  return res.status(200).send(amendment);
};

exports.getAmendmentsByDealId = async (req, res) => {
  const { dealId, status, type } = req.params;
  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
  let amendment;
  switch (status) {
    case CONSTANTS.AMENDMENT.AMENDMENT_QUERY_STATUSES.IN_PROGRESS:
      amendment = (await findAmendmentByStatusAndDealId(dealId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS)) ?? [];
      break;
    case CONSTANTS.AMENDMENT.AMENDMENT_QUERY_STATUSES.COMPLETED:
      if (type === CONSTANTS.AMENDMENT.AMENDMENT_QUERIES.LATEST) {
        amendment = (await findLatestCompletedAmendmentByDealId(dealId)) ?? {};
      } else {
        amendment = (await findAmendmentByStatusAndDealId(dealId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED)) ?? [];
      }
      break;
    default:
      amendment = (await findAmendmentsByDealId(dealId)) ?? [];
  }
  return res.status(200).send(amendment);
};
