import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest, PortalAmendmentStatus, TfmAmendmentStatus, AmendmentType } from '@ukef/dtfs2-common';
import api from '../../api';

export type GetFacilityAmendmentsOnDealRequest = CustomExpressRequest<{
  params: {
    dealId: string;
  };
  query: {
    statuses: PortalAmendmentStatus[] | TfmAmendmentStatus[];
    types: AmendmentType[];
  };
}>;

/**
 * Get the facility amendment
 * @param req - The request object
 * @param res - The response object
 */
export const getFacilityAmendmentsOnDeal = async (req: GetFacilityAmendmentsOnDealRequest, res: Response) => {
  const { dealId } = req.params;
  const { statuses, types } = req.query;

  try {
    const amendments = await api.getFacilityAmendmentsOnDeal(dealId, statuses, types);

    return res.status(HttpStatusCode.Ok).send(amendments);
  } catch (error) {
    const errorMessage = 'Failed to get the portal amendments for the given deal';
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
