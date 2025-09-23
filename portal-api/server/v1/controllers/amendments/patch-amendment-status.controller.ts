import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';
import { PatchPortalFacilityAmendmentStatusPayload } from '../../validation/route-validators/amendments/validate-patch-portal-facility-amendment-status-payload';

export type PatchAmendmentStatusRequest = CustomExpressRequest<{
  params: {
    facilityId: string;
    amendmentId: string;
  };
  reqBody: PatchPortalFacilityAmendmentStatusPayload;
}>;

/**
 * Updates a portal facility amendment status
 * @param req - The request object
 * @param res - The response object
 */
export const patchAmendmentStatus = async (req: PatchAmendmentStatusRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { newStatus, makersEmail, checkersEmail, emailVariables } = req.body;

  const auditDetails = generatePortalAuditDetails(req.user._id);

  try {
    const updatedAmendment = await api.patchPortalFacilityAmendmentStatus({
      facilityId,
      amendmentId,
      newStatus,
      auditDetails,
      makersEmail,
      checkersEmail,
      emailVariables,
    });

    return res.status(HttpStatusCode.Ok).send(updatedAmendment);
  } catch (error) {
    const errorMessage = 'Failed to update the amendment';
    console.error('%s %o', errorMessage, error);

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
