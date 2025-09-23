import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';
import { DeletePortalFacilityAmendmentPayload } from '../../validation/route-validators/amendments/validate-delete-portal-facility-amendment-payload';

export type DeleteAmendmentRequest = CustomExpressRequest<{
  params: {
    facilityId: string;
    amendmentId: string;
  };
  reqBody: DeletePortalFacilityAmendmentPayload;
}>;

/**
 * Delete a portal facility amendment
 * @param req - The request object
 * @param res - The response object
 */
export const deleteAmendment = async (req: DeleteAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { makersEmail, checkersEmail, emailVariables } = req.body;

  const auditDetails = generatePortalAuditDetails(req.user._id);

  try {
    await api.deletePortalFacilityAmendment(facilityId, amendmentId, auditDetails, makersEmail, checkersEmail, emailVariables);

    return res.status(HttpStatusCode.Ok).send();
  } catch (error) {
    const errorMessage = 'Failed to delete the amendment';
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
