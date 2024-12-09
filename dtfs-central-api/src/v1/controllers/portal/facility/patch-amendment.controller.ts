import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { PatchPortalFacilityAmendmentPayload } from '../../../routes/middleware/payload-validation/validate-patch-portal-facility-amendment-payload';

type PatchAmendmentRequestParams = { facilityId: string; amendmentId: string };
export type PatchAmendmentRequest = CustomExpressRequest<{ params: PatchAmendmentRequestParams; reqBody: PatchPortalFacilityAmendmentPayload }>;

/**
 * patch portal facility amendment
 * @param req - request
 * @param res - response
 */
export const patchAmendment = async (req: PatchAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { auditDetails, update } = req.body;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    await PortalFacilityAmendmentService.updatePortalFacilityAmendment({ amendmentId, facilityId, update, auditDetails });

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    console.error(`Error updating amendment with id ${amendmentId} on facilityId ${facilityId}: %o`, error);

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when updating amendment',
    });
  }
};
