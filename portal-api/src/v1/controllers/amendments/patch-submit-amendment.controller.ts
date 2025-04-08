import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';
import { PatchPortalFacilitySubmitAmendmentPayload } from '../../validation/route-validators/amendments/validate-patch-portal-facility-submit-amendment-payload';

export type PatchSubmitAmendmentRequest = CustomExpressRequest<{
  params: {
    facilityId: string;
    amendmentId: string;
  };
  reqBody: PatchPortalFacilitySubmitAmendmentPayload;
}>;

/**
 * Updates a portal facility amendment
 * @param req - The request object
 * @param res - The response object
 */
export const patchSubmitAmendment = async (req: PatchSubmitAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { newStatus, referenceNumber } = req.body;

  const auditDetails = generatePortalAuditDetails(req.user._id);

  try {
    const updatedAmendment = await api.patchPortalFacilitySubmitAmendment({
      facilityId,
      amendmentId,
      newStatus,
      referenceNumber,
      auditDetails,
    });

    return res.status(HttpStatusCode.Ok).send(updatedAmendment);
  } catch (error) {
    const errorMessage = 'Failed to update the amendment';
    console.error(errorMessage, error);

    if (error instanceof ApiError) {
      return res.status(error.status).send({
        status: error.status,
        message: `${errorMessage}: ${error.message}`,
        code: error.code,
      });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: errorMessage,
    });
  }
};
