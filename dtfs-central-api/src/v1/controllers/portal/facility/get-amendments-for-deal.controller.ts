import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';

type GetDealAmendmentsRequestParams = { dealId: string };
export type GetDealAmendmentsRequest = CustomExpressRequest<{ params: GetDealAmendmentsRequestParams }>;

/**
 * get portal facility amendments by deal Id
 * @param req - request
 * @param res - response
 */
export const getPortalAmendmentsByDealId = async (req: GetDealAmendmentsRequest, res: Response) => {
  const { dealId } = req.params;

  try {
    const portalAmendments = await PortalFacilityAmendmentService.findPortalAmendmentsForDeal({ dealId });

    return res.status(HttpStatusCode.Ok).send(portalAmendments);
  } catch (error) {
    console.error(`Error getting amendments for facilities on deal with id ${dealId}: %o`, error);

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
