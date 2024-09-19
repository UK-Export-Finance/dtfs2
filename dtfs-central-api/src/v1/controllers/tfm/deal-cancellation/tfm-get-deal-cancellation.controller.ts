import { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError, ApiErrorResponseBody, TfmDealCancellation } from '@ukef/dtfs2-common';
import { TfmDealCancellationRepo } from '../../../../repositories/tfm-deals-repo';

type GetTfmDealCancellationResponse = Response<ApiErrorResponseBody | TfmDealCancellation>;

export const getTfmDealCancellation = async (req: Request, res: GetTfmDealCancellationResponse) => {
  const { dealId } = req.params;

  try {
    const dealCancellation = await TfmDealCancellationRepo.findDealCancellationByDealId(dealId);

    return res.status(HttpStatusCode.Ok).send(dealCancellation);
  } catch (error) {
    console.error('Error getting deal cancellation:', error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting the deal cancellation object',
    });
  }
};
