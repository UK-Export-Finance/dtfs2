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
}>;

/**
 * Updates a portal facility amendment
 * @param req - The request object
 * @param res - The response object
 */
export const patchAmendment = async (req: PatchAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { update } = req.body;

  const auditDetails = generatePortalAuditDetails(req.user._id);

  try {
    const updatedAmendment = await api.patchPortalFacilityAmendment({
      facilityId,
      amendmentId,
      update,
      auditDetails,
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
