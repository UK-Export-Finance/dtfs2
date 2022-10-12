const { ObjectId } = require('mongodb');
const { getUnixTime } = require('date-fns');
const db = require('../../../../database/mongo-client');
const CONSTANTS = require('../../../../constants');
const { findAmendmentByStatusAndFacilityId, findLatestCompletedAmendmentByFacilityIdVersion } = require('./tfm-get-amendments.controller');
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
        // the version of latest completed amendment (proceed or withdraw or auto) or null
        const latestCompletedAmendmentVersion = await findLatestCompletedAmendmentByFacilityIdVersion(facilityId);

        const amendment = {
          amendmentId: new ObjectId(),
          facilityId: new ObjectId(facilityId),
          dealId,
          createdAt: getUnixTime(new Date()),
          updatedAt: getUnixTime(new Date()),
          status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.NOT_STARTED,
          version: 1
        };
        if (latestCompletedAmendmentVersion) {
          amendment.version = latestCompletedAmendmentVersion + 1;
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
