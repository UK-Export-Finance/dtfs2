const { ObjectId } = require('mongodb');
const { getUnixTime } = require('date-fns');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const { findAmendmentInProgress } = require('./tfm-get-amendments.controller');
const { findOneFacility } = require('../facility/tfm-get-facility.controller');

exports.postTfmAmendment = async (req, res) => {
  const { id: facilityId } = req.params;
  // check if the facility Id is valid
  if (ObjectId.isValid(facilityId)) {
    const collection = await db.getCollection('tfm-facilities');

    const facility = await findOneFacility(facilityId);
    const amendmentInProgress = await findAmendmentInProgress(facilityId);

    // check if the facility exists
    if (facility) {
      // check if there is an amendment in progress
      if (!amendmentInProgress) {
        const amendment = {
          amendmentId: new ObjectId(),
          createdAt: getUnixTime(new Date()),
          updatedAt: getUnixTime(new Date()),
          status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS,
        };

        await collection.updateOne(
          { _id: { $eq: ObjectId(facilityId) } },
          { $push: { amendments: amendment } },
        );

        return res.status(200).json({ amendmentId: amendment.amendmentId.toHexString() });
      }
      return res.status(400).send({ status: 400, message: 'The current facility already has an amendment in progress' });
    }
    return res.status(404).send({ status: 404, message: 'The current facility does not exist' });
  }
  return res.status(400).send({ status: 400, message: 'Invalid facility id' });
};
