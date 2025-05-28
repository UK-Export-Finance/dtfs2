import { ApiError, CustomExpressRequest, PortalAmendmentStatus } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

type GetAmendmentsOnDealRequestParams = { dealId: string };
export type GetAmendmentsOnDealRequest = CustomExpressRequest<{
  params: GetAmendmentsOnDealRequestParams;
  query: { statuses?: PortalAmendmentStatus[] };
}>;

/**
 * get all type facility amendments by deal Id
 * @param req - request
 * @param res - response
 */
export const getAmendmentsOnDeal = async (req: GetAmendmentsOnDealRequest, res: Response) => {
  const { dealId } = req.params;
  const { statuses } = req.query;

  try {
    const amendments = await TfmFacilitiesRepo.findAllTypeAmendmentsByDealIdAndStatus({ dealId, statuses });

    return res.status(HttpStatusCode.Ok).send(amendments);
  } catch (error) {
    console.error(`Error getting amendments for facilities on deal with id %s %o`, dealId, error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting all type facility amendments on deal',
    });
  }
};
