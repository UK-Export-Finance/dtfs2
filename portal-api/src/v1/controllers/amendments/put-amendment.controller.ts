import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest, PortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';

export type PutAmendmentRequest = CustomExpressRequest<{
  params: {
    facilityId: string;
  };
  reqBody: {
    amendment: PortalFacilityAmendmentUserValues;
    dealId: string;
  };
}>;

/**
 * Upserts a draft portal facility amendment into the database
 * @param req - The request object
 * @param res - The response object
 */
export const putAmendment = async (req: PutAmendmentRequest, res: Response) => {
  const { facilityId } = req.params;
  const { dealId, amendment } = req.body;

  try {
    const amendmentResponse = await api.putPortalFacilityAmendment({
      dealId,
      facilityId,
      amendment,
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
