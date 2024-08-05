import { Response } from 'express';
import { flatten } from 'mongo-dot-notation';
import { getUnixTime } from 'date-fns';
import { HttpStatusCode } from 'axios';
import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { NotFoundError } from '../../../../errors';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { PutFacilityAmendmentPayload } from '../../../routes/middleware/payload-validation';

type UpdateTfmAmendmentRequest = CustomExpressRequest<{
  reqBody: PutFacilityAmendmentPayload;
}>;

export const updateTfmAmendment = async (req: UpdateTfmAmendmentRequest, res: Response) => {
  const { payload, auditDetails } = req.body;
  const { amendmentId, facilityId } = req.params;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.TFM);

    const foundAmendment = await TfmFacilitiesRepo.findAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);
    if (!foundAmendment) {
      throw new NotFoundError('The amendment does not exist');
    }

    const update = { ...payload, updatedAt: getUnixTime(new Date()) };

    await TfmFacilitiesRepo.updateOneByIdAndAmendmentId(
      facilityId,
      amendmentId,
      flatten({
        'amendments.$': update,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      }),
    );

    const updatedAmendment = await TfmFacilitiesRepo.findAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);
    return res.status(HttpStatusCode.Ok).json(updatedAmendment);
  } catch (error) {
    console.error('Error updating amendment:', error);
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails: ${error.message}`,
      });
    }
    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: error.message,
      });
    }
    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error',
    });
  }
};
