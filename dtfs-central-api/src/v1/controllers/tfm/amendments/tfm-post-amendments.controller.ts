import util from 'util';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { CustomExpressRequest, ApiError, TfmFacilityAmendment, AUDIT_USER_TYPES, AMENDMENT_STATUS, ApiErrorResponseBody } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { PostFacilityAmendmentPayload } from '../../../routes/middleware/payload-validation';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { NotFoundError, ResourceAlreadyExistsError } from '../../../../errors';

type PostTfmAmendmentRequest = CustomExpressRequest<{
  reqBody: PostFacilityAmendmentPayload;
}>;

type PostTfmAmendmentResponse = Response<ApiErrorResponseBody | { amendmentId: string }>;

export const postTfmAmendment = async (req: PostTfmAmendmentRequest, res: PostTfmAmendmentResponse) => {
  const { facilityId } = req.params;
  const { auditDetails } = req.body;
  console.info(util.inspect({ facilityId, auditDetails }, { showHidden: false, depth: null, colors: true }));

  try {
    console.info('In try block');
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.TFM);

    const facility = await TfmFacilitiesRepo.findOneById(facilityId);
    console.info(util.inspect({ facility }, { showHidden: false, depth: null, colors: true }));
    if (!facility) {
      throw new NotFoundError('The current facility does not exist');
    }

    const inProgressAmendments = await TfmFacilitiesRepo.findAmendmentsByFacilityIdAndStatus(facilityId, AMENDMENT_STATUS.IN_PROGRESS);
    console.info(util.inspect({ inProgressAmendments }, { showHidden: false, depth: null, colors: true }));

    if (inProgressAmendments.length !== 0) {
      throw new ResourceAlreadyExistsError('The current facility already has an amendment in progress');
    }

    const { dealId } = facility.facilitySnapshot;
    // the version of latest completed amendment (proceed or withdraw or auto) or null
    console.info(util.inspect({ dealId }, { showHidden: false, depth: null, colors: true }));

    const latestCompletedAmendment = await TfmFacilitiesRepo.findLatestCompletedAmendmentByFacilityId(facilityId);
    const latestCompletedAmendmentVersion = (latestCompletedAmendment && latestCompletedAmendment.version) ?? undefined;
    console.info(util.inspect({ latestCompletedAmendment, latestCompletedAmendmentVersion }, { showHidden: false, depth: null, colors: true }));

    const amendment: TfmFacilityAmendment = {
      amendmentId: new ObjectId(),
      facilityId: new ObjectId(facilityId),
      dealId,
      createdAt: getUnixTime(new Date()),
      updatedAt: getUnixTime(new Date()),
      status: AMENDMENT_STATUS.NOT_STARTED,
      version: latestCompletedAmendmentVersion ? latestCompletedAmendmentVersion + 1 : 1,
    };
    console.info(util.inspect({ amendment }, { showHidden: false, depth: null, colors: true }));
    const resultFromUpdatingTheDatabase = await TfmFacilitiesRepo.updateOneById(facilityId, {
      $push: { amendments: amendment },
      $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    });
    console.info(util.inspect({ resultFromUpdatingTheDatabase }, { showHidden: false, depth: null, colors: true }));
    return res.status(HttpStatusCode.Ok).json({ amendmentId: amendment.amendmentId.toHexString() });
  } catch (error) {
    console.error('Error posting amendment:', error);
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }
    return res.status(HttpStatusCode.InternalServerError).send({ status: HttpStatusCode.InternalServerError, message: 'An unknown error occurred' });
  }
};
