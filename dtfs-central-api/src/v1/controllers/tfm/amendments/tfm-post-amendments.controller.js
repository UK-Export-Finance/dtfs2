const { ObjectId } = require('mongodb');
const { getUnixTime } = require('date-fns');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const { findAmendmentByStatusAndFacilityId, findLatestCompletedAmendmentByFacilityId } = require('./tfm-get-amendments.controller');
const { findOneFacility } = require('../facility/tfm-get-facility.controller');

exports.postTfmAmendment = async (req, res) => {
  const { facilityId } = req.params;
  // check if the facility Id is valid
  if (ObjectId.isValid(facilityId)) {
    const facility = await findOneFacility(facilityId);

    // check if the facility exists
    if (facility) {
      const amendmentInProgress = await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS);
      // check if there is an amendment in progress
      if (!amendmentInProgress) {
        const { dealId } = facility.facilitySnapshot;
        const latestCompletedAmendment = await findLatestCompletedAmendmentByFacilityId(facilityId);

        const amendment = {
          amendmentId: new ObjectId(),
          facilityId: new ObjectId(facilityId),
          dealId,
          createdAt: getUnixTime(new Date()),
          updatedAt: getUnixTime(new Date()),
          status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.NOT_STARTED,
          version: 1
        };
        if (latestCompletedAmendment) {
          amendment.version = latestCompletedAmendment.version + 1;
        }
        const collection = await db.getCollection('tfm-facilities');
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
