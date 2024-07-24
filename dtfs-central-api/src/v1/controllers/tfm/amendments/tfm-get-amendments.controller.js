const { ObjectId } = require('mongodb');
const { TfmFacilitiesRepo } = require('../../../../repositories/tfm-facilities-repo');
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
    const amendmentsWithStatus = await TfmFacilitiesRepo.findAmendmentsByStatus(status);

    // returns the amendments for the given status
    return amendmentsWithStatus;
  } catch (error) {
    console.error('Unable to find amendments object %o', error);
    return null;
  }
};

exports.getAllAmendmentsInProgress = async (req, res) => {
  const amendments = await findAllAmendmentsByStatus(CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS);

  return res.status(200).send(amendments);
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
    const amendmentsForFacility = await TfmFacilitiesRepo.findAmendmentsByFacilityId(facilityId);

    // returns the amendment object for the given facilityId
    return amendmentsForFacility;
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
    const amendments = await TfmFacilitiesRepo.findAmendmentsByFacilityIdAndAmendmentId(facilityId, amendmentId);

    // returns the amendment object for the given facilityId and amendmentId
    return amendments.at(0) ?? null;
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
    const amendments = await TfmFacilitiesRepo.findAmendmentsByDealId(dealId);

    // returns the amendment object for the given dealId
    return amendments;
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
    const amendments = await TfmFacilitiesRepo.findAmendmentsByFacilityIdAndStatus(facilityId, status);

    // returns the amendment object for the given facilityId and status
    return amendments.at(0) ?? null;
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
    const amendments = await TfmFacilitiesRepo.findAmendmentsByDealIdAndStatus(dealId, status);

    // returns the amendment object for the given dealId
    return amendments.at(0) ?? null;
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

  try {
    const latestCompletedAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);

    if (latestCompletedAmendment) {
      return {
        amendmentId: latestCompletedAmendment.amendmentId,
        value: latestCompletedAmendment.value,
        currency: latestCompletedAmendment.currency,
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

  try {
    const latestCompletedAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);

    if (latestCompletedAmendment) {
      return {
        amendmentId: latestCompletedAmendment.amendmentId,
        coverEndDate: latestCompletedAmendment.coverEndDate,
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

  try {
    const latestCompletedAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);
    return (latestCompletedAmendment && latestCompletedAmendment.version) ?? null;
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
    return await TfmFacilitiesRepo.findLatestCompletedAmendmentByDealId(dealId);
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
      amendment = (await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS)) ?? {};
      break;
    }
    case CONSTANTS.AMENDMENT.AMENDMENT_QUERY_STATUSES.COMPLETED:
      if (type === CONSTANTS.AMENDMENT.AMENDMENT_QUERIES.LATEST_VALUE) {
        amendment = (await findLatestCompletedValueAmendmentByFacilityId(facilityId)) ?? {};
      } else if (type === CONSTANTS.AMENDMENT.AMENDMENT_QUERIES.LATEST_COVER_END_DATE) {
        amendment = (await findLatestCompletedDateAmendmentByFacilityId(facilityId)) ?? {};
      } else {
        amendment = await TfmFacilitiesRepo.findAmendmentsByFacilityIdAndStatus(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED);
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
      amendment = await findAmendmentsByDealId(dealId);
  }
  return res.status(200).send(amendment);
};
