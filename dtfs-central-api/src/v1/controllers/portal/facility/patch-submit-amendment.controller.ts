import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest, InvalidPayloadError, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { PatchPortalFacilitySubmitAmendmentPayload } from '../../../routes/middleware/payload-validation/validate-patch-portal-facility-submit-amendment-payload';

type PatchSubmitAmendmentToUkefRequestParams = {
  facilityId: string;
  amendmentId: string;
};

export type PatchSubmitAmendmentToUkefRequest = CustomExpressRequest<{
  params: PatchSubmitAmendmentToUkefRequestParams;
  reqBody: PatchPortalFacilitySubmitAmendmentPayload;
}>;

/**
 * patch portal facility amendment
 * if newStatus is PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL, submit the amendment to ukef
 * @param req - request
 * @param res - response
 */
export const patchSubmitAmendment = async (req: PatchSubmitAmendmentToUkefRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { auditDetails, newStatus, referenceNumber } = req.body;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    switch (newStatus) {
      case PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED: {
        const updatedSubmitAmendment = await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
          facilityId,
          amendmentId,
          newStatus,
          referenceNumber,
          auditDetails,
        });

        return res.status(HttpStatusCode.Ok).send(updatedSubmitAmendment);
      }
      default: {
        // This error should never be thrown since the payload is validated by Zod middleware
        throw new InvalidPayloadError(`Invalid requested status update: ${newStatus}`);
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    console.error(`Error updating portal amendment on submit %o`, error);

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when updating portal amendment status',
    });
  }
};
