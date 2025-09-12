import { ApiError, CustomExpressRequest, PortalAmendmentStatus } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

export type GetAllPortalAmendmentsRequest = CustomExpressRequest<{
  query: { statuses?: PortalAmendmentStatus[] };
}>;

/**
 * get all portal facility amendments
 * @param req - request
 * @param res - response
 * @returns all portal facility amendments
 */
export const getAllPortalAmendments = async (req: GetAllPortalAmendmentsRequest, res: Response) => {
  const { statuses } = req.query;

  try {
    const allPortalAmendments = await TfmFacilitiesRepo.findAllPortalAmendmentsByStatus({ statuses });

    if (!allPortalAmendments) {
      return res.status(HttpStatusCode.NoContent).send({});
    }

    return res.status(HttpStatusCode.Ok).send(allPortalAmendments);
  } catch (error) {
    console.error(`Error getting all amendments for portal facilities: %o`, error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting all portal facility amendments',
    });
  }
};
