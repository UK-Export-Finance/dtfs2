import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { PostSubmitPortalFacilityAmendmentToCheckerPayload } from '../../../routes/middleware/payload-validation/validate-post-submit-portal-facility-amendment-to-checker-payload';

type PutAmendmentRequestParams = { facilityId: string; amendmentId: string };
export type PutAmendmentRequest = CustomExpressRequest<{ params: PutAmendmentRequestParams; reqBody: PostSubmitPortalFacilityAmendmentToCheckerPayload }>;

/**
 * post portal facility amendment submit to checker
 * @param req - request
 * @param res - response
 */
export const postSubmitAmendmentToChecker = async (req: PutAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { auditDetails, dealId } = req.body;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    const updatedAmendment = await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker({ facilityId, amendmentId, dealId, auditDetails });

    return res.status(HttpStatusCode.Ok).send(updatedAmendment);
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    console.error(`Error submitting amendment to checker on facilityId ${facilityId}: %o`, error);

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when submitting amendment to checker',
    });
  }
};
