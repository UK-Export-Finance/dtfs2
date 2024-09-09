const { AUDIT_USER_TYPES } = require('@ukef/dtfs2-common');
const { InvalidAuditDetailsError } = require('@ukef/dtfs2-common');
const { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetailsAndUserType } = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { getUnixTime } = require('date-fns');
const { findAmendmentById } = require('./tfm-get-amendments.controller');
const { TfmFacilitiesRepo } = require('../../../../repositories/tfm-facilities-repo');

exports.updateTfmAmendment = async (req, res) => {
  const { payload, auditDetails } = req.body;
  const { amendmentId, facilityId } = req.params;

  if (!ObjectId.isValid(facilityId) || !ObjectId.isValid(amendmentId)) {
    return res.status(400).send({ status: 400, message: 'Invalid facility or amendment id' });
  }

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.TFM);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  const findAmendment = await findAmendmentById(facilityId, amendmentId);
  if (!findAmendment) {
    return res.status(404).send({ status: 404, message: 'The amendment does not exist' });
  }

  const protectedProperties = ['_id', 'amendmentId', 'facilityId', 'dealId', 'createdAt', 'updatedAt', 'version'];

  for (const property of protectedProperties) {
    delete payload[property];
  }

  const update = { ...payload, updatedAt: getUnixTime(new Date()) };

  await TfmFacilitiesRepo.updateOneByIdAndAmendmentId(
    facilityId,
    amendmentId,
    $.flatten({
      'amendments.$': update,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    }),
  );

  const updatedAmendment = await findAmendmentById(facilityId, amendmentId);
  return res.status(200).json({ ...updatedAmendment });
};
