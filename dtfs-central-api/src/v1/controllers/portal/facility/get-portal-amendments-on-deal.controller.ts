import { ApiError, CustomExpressRequest, PortalAmendmentStatus } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

type GetPortalAmendmentsOnDealRequestParams = { dealId: string };
export type GetPortalAmendmentsOnDealRequest = CustomExpressRequest<{
  params: GetPortalAmendmentsOnDealRequestParams;
  query: { statuses?: PortalAmendmentStatus[] };
}>;

/**
 * get portal facility amendments by deal Id
 * @param req - request
 * @param res - response
 */
export const getPortalAmendmentsOnDeal = async (req: GetPortalAmendmentsOnDealRequest, res: Response) => {
  const { dealId } = req.params;
  const { statuses } = req.query;

  try {
    const portalAmendments = await TfmFacilitiesRepo.findPortalAmendmentsByDealIdAndStatus({ dealId, statuses });

    return res.status(HttpStatusCode.Ok).send(portalAmendments);
  } catch (error) {
    console.error('Error getting portal amendments for facilities on deal with id %s %o', dealId, error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting portal facility amendments on deal',
    });
  }
};
