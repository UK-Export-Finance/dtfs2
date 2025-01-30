import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { DeletePortalFacilityAmendmentPayload } from '../../../routes/middleware/payload-validation/validate-delete-portal-facility-amendment-payload';

type DeletePortalAmendmentRequestParams = { facilityId: string; amendmentId: string };
export type DeletePortalAmendmentRequest = CustomExpressRequest<{ params: DeletePortalAmendmentRequestParams; reqBody: DeletePortalFacilityAmendmentPayload }>;

/**
 * delete portal facility amendment
 * @param req - request
 * @param res - response
 */
export const deletePortalAmendment = async (req: DeletePortalAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { auditDetails } = req.body;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    await TfmFacilitiesRepo.deletePortalFacilityAmendment({
      facilityId: new ObjectId(facilityId),
      amendmentId: new ObjectId(amendmentId),
      auditDetails,
    });

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      console.error('Error deleting amendment: %s', message);
      return res.status(status).send({ status, message, code });
    }

    console.error('Error deleting amendment on facilityId %s: %o', facilityId, error);

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when deleting portal amendment',
    });
  }
};
