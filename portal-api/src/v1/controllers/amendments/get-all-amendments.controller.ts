import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest, PortalAmendmentStatus } from '@ukef/dtfs2-common';
import api from '../../api';

export type GetAllFacilityAmendmentsRequest = CustomExpressRequest<{
  query: {
    statuses: PortalAmendmentStatus[];
  };
}>;

/**
 * Get the portal facility amendments
 * @param req - The request object
 * @param res - The response object
 */
export const getAllFacilityAmendments = async (req: GetAllFacilityAmendmentsRequest, res: Response) => {
  const { statuses } = req.query;

  try {
    const amendments = await api.getAllPortalFacilityAmendments(statuses);

    return res.status(HttpStatusCode.Ok).send(amendments);
  } catch (error) {
    const errorMessage = 'Failed to get all portal amendments';
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
