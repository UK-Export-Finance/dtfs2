const { ObjectId } = require('mongodb');
const { getUnixTime } = require('date-fns');
const { generateAuditDatabaseRecordFromAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-database-record');
const { validateAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/validate-audit-details');
const db = require('../../../../drivers/db-client');
const CONSTANTS = require('../../../../constants');
const { findAmendmentByStatusAndFacilityId, findLatestCompletedAmendmentByFacilityIdVersion } = require('./tfm-get-amendments.controller');
const { findOneFacility } = require('../facility/tfm-get-facility.controller');

exports.postTfmAmendment = async (req, res) => {
  const { facilityId } = req.params;
  if (!ObjectId.isValid(facilityId)) {
    return res.status(400).send({ status: 400, message: 'Invalid facility id' });
  }

  const { auditDetails } = req.body;

  try {
    validateAuditDetails(auditDetails);
  } catch ({ message }) {
    return res.status(400).send({ status: 400, message: `Invalid auditDetails, ${message}` });
  }

  if (auditDetails.userType !== 'tfm') {
    return res.status(400).send({ status: 400, message: `Invalid auditDetails, userType must be 'tfm'` });
  }

  const facility = await findOneFacility(facilityId);

  if (!facility) {
    return res.status(404).send({ status: 404, message: 'The current facility does not exist' });
  }

  const amendmentInProgress = await findAmendmentByStatusAndFacilityId(facilityId, CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS);
  if (amendmentInProgress) {
    return res.status(400).send({ status: 400, message: 'The current facility already has an amendment in progress' });
  }

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
    version: 1,
  };
  if (latestCompletedAmendmentVersion) {
    amendment.version = latestCompletedAmendmentVersion + 1;
  }
  const collection = await db.getCollection(CONSTANTS.DB_COLLECTIONS.TFM_FACILITIES);
  await collection.updateOne(
    { _id: { $eq: ObjectId(facilityId) } },
    { $push: { amendments: amendment }, $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) } },
  );

  return res.status(200).json({ amendmentId: amendment.amendmentId.toHexString() });
};
