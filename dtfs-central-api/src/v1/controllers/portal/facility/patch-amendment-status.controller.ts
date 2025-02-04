import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest, InvalidParameterError, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { PatchPortalFacilityAmendmentStatusPayload } from '../../../routes/middleware/payload-validation/validate-patch-portal-facility-amendment-status-payload';

type PatchSubmitAmendmentToCheckerRequestParams = { facilityId: string; amendmentId: string; newStatus: string };
export type PatchSubmitAmendmentToCheckerRequest = CustomExpressRequest<{
  params: PatchSubmitAmendmentToCheckerRequestParams;
  reqBody: PatchPortalFacilityAmendmentStatusPayload;
}>;

/**
 * patch portal facility amendment submit to checker
 * @param req - request
 * @param res - response
 */
export const patchAmendmentStatus = async (req: PatchSubmitAmendmentToCheckerRequest, res: Response) => {
  const { facilityId, amendmentId, newStatus } = req.params;
  const { auditDetails, dealId } = req.body;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    if (newStatus === PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL) {
      const updatedAmendment = await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker({ facilityId, amendmentId, dealId, auditDetails });

      return res.status(HttpStatusCode.Ok).send(updatedAmendment);
    }

    throw new InvalidParameterError('newStatus', newStatus);
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
