import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';

export type DeleteAmendmentRequest = CustomExpressRequest<{
  params: {
    facilityId: string;
    amendmentId: string;
  };
}>;

/**
 * Delete a portal facility amendment
 * @param req - The request object
 * @param res - The response object
 */
export const deleteAmendment = async (req: DeleteAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;

  const auditDetails = generatePortalAuditDetails(req.user._id);

  try {
    await api.deletePortalFacilityAmendment(facilityId, amendmentId, auditDetails);

    return res.status(HttpStatusCode.Ok).send();
  } catch (error) {
    const errorMessage = 'Failed to delete the amendment';
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
