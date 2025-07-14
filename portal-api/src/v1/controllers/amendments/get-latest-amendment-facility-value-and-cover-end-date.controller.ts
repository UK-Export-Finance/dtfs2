import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import api from '../../api';

export type GetPortalFacilityAmendmentsOnDealRequest = CustomExpressRequest<{
  params: {
    facilityId: string;
  };
}>;

/**
 * Get the portal facility amendment
 * @param req - The request object
 * @param res - The response object
 */
export const getLatestAmendmentFacilityValueAndCoverEndDate = async (req: GetPortalFacilityAmendmentsOnDealRequest, res: Response) => {
  const { facilityId } = req.params;

  try {
    const valueAndCoverEndDate = await api.getLatestAmendmentFacilityValueAndCoverEndDate(facilityId);

    return res.status(HttpStatusCode.Ok).send(valueAndCoverEndDate);
  } catch (error) {
    const errorMessage = 'Failed to get the portal amendments for the given deal';
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
