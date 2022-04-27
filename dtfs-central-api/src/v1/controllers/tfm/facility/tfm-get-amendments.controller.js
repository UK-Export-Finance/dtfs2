const { ObjectId } = require('mongodb');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');

// returns an array of object containing all properties for a given facilityId:
// [{
//     "amendmentId": "62692866ce546902bfcd9168",
//     "createdAt": 1651058790,
//     "updatedAt": 1651059653,
//     "status": "In progress",
// }]
const findAllAmendments = async (facilityId) => {
  const collection = await db.getCollection('tfm-facilities');

  try {
    const amendment = await collection.aggregate([
      { $match: { _id: ObjectId(facilityId) } },
      { $project: { _id: 0, amendments: '$amendments.history' } },
    ]).toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0].amendments;
  } catch (err) {
    console.error('Unable to find amendments object %O', { err });
    return null;
  }
};

exports.getAllAmendments = async (req, res) => {
  const { id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAllAmendments(facilityId);
    if (amendment) {
      return res.status(200).send({ status: 200, amendment });
    }

    return res.status(404).send({ status: 404, message: 'The current facility doesn\'t have any amendments' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};

// returns an object containing all properties for a given amendmentId:
// {
//     "amendmentId": "62692866ce546902bfcd9168",
//     "createdAt": 1651058790,
//     "updatedAt": 1651059653,
//     "status": "In progress",
// }
const findAmendmentById = async (facilityId, amendmentId) => {
  const collection = await db.getCollection('tfm-facilities');

  try {
    const amendment = await collection.aggregate([
      { $match: { _id: ObjectId(facilityId), 'amendments.history.amendmentId': ObjectId(amendmentId) } },
      {
        $project: {
          _id: 0,
          amendments: {
            $filter: {
              input: '$amendments.history',
              as: 'amendment',
              cond: { $eq: ['$$amendment.amendmentId', ObjectId(amendmentId)] },
            },
          },
        },
      },
      { $unwind: '$amendments' },
    ]).toArray();

    // returns the amendment object for the given facilityId and amendmentId
    return amendment[0].amendments;
  } catch (err) {
    console.error('Unable to find amendments object %O', { err });
    return null;
  }
};
exports.findAmendmentById = findAmendmentById;

/**
 * returns whole amendment object/collection in object
 * includes status and history array
 * 200 if found or 400 if invalid facilityId
 */
exports.getAmendmentById = async (req, res) => {
  const { id: facilityId, amendmentId } = req.params;
  if (ObjectId.isValid(facilityId) && ObjectId.isValid(amendmentId)) {
    const amendment = await findAmendmentById(facilityId, amendmentId);
    if (amendment) {
      return res.status(200).send({ status: 200, amendment });
    }

    return res.status(404).send({ status: 404, message: 'The current facility doesn\'t have the specified amendment' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility or amendment Id' });
};

// returns an object containing an amendment that's in progress based on a given facilityId:
// {
//     "amendmentId": "62692866ce546902bfcd9168",
//     "createdAt": 1651058790,
//     "updatedAt": 1651059653,
//     "status": "In progress",
// }
const findAmendmentInProgress = async (facilityId) => {
  const collection = await db.getCollection('tfm-facilities');

  try {
    const amendment = await collection.aggregate([
      { $match: { _id: ObjectId(facilityId), 'amendments.history.status': CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS } },
      {
        $project: {
          _id: 0,
          amendments: {
            $filter: {
              input: '$amendments.history',
              as: 'amendment',
              cond: { $eq: ['$$amendment.status', CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS] },
            },
          },
        },
      },
    ]).toArray();
    // returns the amendment object for the given facilityId
    return amendment[0]?.amendments || [];
  } catch (err) {
    console.error('Unable to find amendments object %O', { err });
    return null;
  }
};
exports.findAmendmentInProgress = findAmendmentInProgress;

exports.getAmendmentInProgress = async (req, res) => {
  const { id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAmendmentInProgress(facilityId);
    return res.status(200).send({ status: 200, amendment });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};
