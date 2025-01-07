import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest, PortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';

export type PatchAmendmentRequest = CustomExpressRequest<{
  params: {
    facilityId: string;
    amendmentId: string;
  };
  reqBody: {
    update: PortalFacilityAmendmentUserValues;
  };
  query: { dealId: string };
}>;

/**
 * Updates a portal facility amendment
 * @param req - The request object
 * @param res - The response object
 */
export const patchAmendment = async (req: PatchAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { update } = req.body;

  try {
    const amendmentResponse = await api.patchPortalFacilityAmendment({
      facilityId,
      amendmentId,
      update,
      auditDetails: generatePortalAuditDetails(req.user._id),
    });

    return res.status(HttpStatusCode.Ok).send(amendmentResponse);
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
