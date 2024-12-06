import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { PutPortalFacilityAmendmentPayload } from '../../../routes/middleware/payload-validation/validate-put-portal-facility-amendment-payload';

type PutAmendmentRequestParams = { facilityId: string };
export type PutAmendmentRequest = CustomExpressRequest<{ params: PutAmendmentRequestParams; reqBody: PutPortalFacilityAmendmentPayload }>;

/**
 * get portal facility amendment
 * @param req - request
 * @param res - response
 */
export const putAmendmentDraft = async (req: PutAmendmentRequest, res: Response) => {
  const { facilityId } = req.params;
  const { auditDetails, amendment, dealId } = req.body;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    const upsertedAmendment = await PortalFacilityAmendmentService.upsertPortalFacilityAmendmentDraft({ dealId, facilityId, amendment, auditDetails });

    return res.status(HttpStatusCode.Ok).send(upsertedAmendment);
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    console.error(`Error upserting draft amendment on facilityId ${facilityId}: %o`, error);

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting amendment',
    });
  }
};
