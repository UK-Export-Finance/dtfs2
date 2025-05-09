import { AmendmentType, ApiError, CustomExpressRequest, PortalAmendmentStatus, TfmAmendmentStatus } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

type GetAmendmentsOnDealRequestParams = { dealId: string };
export type GetAmendmentsOnDealRequest = CustomExpressRequest<{
  params: GetAmendmentsOnDealRequestParams;
  query: { statuses?: PortalAmendmentStatus[] | TfmAmendmentStatus[]; types: AmendmentType[] };
}>;

/**
 * get facility amendments by deal Id
 * @param req - request
 * @param res - response
 */
export const getAmendmentsOnDeal = async (req: GetAmendmentsOnDealRequest, res: Response) => {
  const { dealId } = req.params;
  const { statuses, types } = req.query;

  try {
    const amendments = await TfmFacilitiesRepo.findAmendmentsByDealIStatusAndType({ dealId, statuses, types });

    return res.status(HttpStatusCode.Ok).send(amendments);
  } catch (error) {
    console.error(`Error getting amendments for facilities on deal with id ${dealId}: %o`, error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting facility amendments on deal',
    });
  }
};
