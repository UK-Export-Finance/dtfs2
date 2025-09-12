import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import api from '../../api';

export type GetDealCancellationRequest = CustomExpressRequest<{
  params: {
    dealId: string;
  };
}>;

/**
 * Get the TFM deal cancellation object
 * @param req - The request object
 * @param res - The response object
 */
export const getDealCancellation = async (req: GetDealCancellationRequest, res: Response) => {
  const { dealId } = req.params;

  try {
    const dealCancellation = await api.getDealCancellation(dealId);

    return res.status(HttpStatusCode.Ok).send(dealCancellation);
  } catch (error) {
    const errorMessage = 'Failed to get deal cancellation';
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
