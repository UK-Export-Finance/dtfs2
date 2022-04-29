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
const findAllAmendmentsByFacilityId = async (facilityId) => {
  const collection = await db.getCollection('tfm-facilities');

  try {
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

// returns an object containing an amendment that's in progress based on a given facilityId:
// {
//     "amendmentId": "62692866ce546902bfcd9168",
//     "createdAt": 1651058790,
//     "updatedAt": 1651059653,
//     "status": "In progress",
// }
const findAmendmentInProgress = async (facilityId) => {
  const collection = await db.getCollection('tfm-facilities');

  if (ObjectId.isValid(facilityId)) {
    try {
      const amendment = await collection.aggregate([
        { $match: { _id: ObjectId(facilityId), 'amendments.status': CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS } },
        {
          $project: {
            _id: 0,
            amendments: {
              $filter: {
                input: '$amendments',
                as: 'amendment',
                cond: { $eq: ['$$amendment.status', CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS] },
              },
            },
          },
        },
      ]).toArray();
      // returns the amendment object for the given facilityId
      return amendment[0]?.amendments[0] || null;
    } catch (err) {
      console.error('Unable to find amendments object %O', { err });
      return null;
    }
  }
  return null;
};
exports.findAmendmentInProgress = findAmendmentInProgress;

exports.getAmendmentInProgress = async (req, res) => {
  const { id: facilityId } = req.params;
  if (ObjectId.isValid(facilityId)) {
    const amendment = await findAmendmentInProgress(facilityId) || [];
    return res.status(200).send(amendment);
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility Id' });
};
