import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import api from '../../api';

export type GetAmendmentRequest = CustomExpressRequest<{
  params: {
    facilityId: string;
    amendmentId: string;
  };
}>;

/**
 * Get the portal facility amendment
 * @param req - The request object
 * @param res - The response object
 */
export const getAmendment = async (req: GetAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;

  try {
    const amendment = await api.getPortalFacilityAmendment(facilityId, amendmentId);

    return res.status(HttpStatusCode.Ok).send(amendment);
  } catch (error) {
    const errorMessage = 'Failed to get the amendment';
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
