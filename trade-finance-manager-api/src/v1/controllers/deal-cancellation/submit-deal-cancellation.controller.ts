import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { PostSubmitDealCancellationPayload } from '../../middleware/validate-post-submit-deal-cancellation-payload';

export type SubmitDealCancellationRequest = CustomExpressRequest<{
  params: {
    dealId: string;
  };
  reqBody: PostSubmitDealCancellationPayload;
}>;

/**
 * Submits cancel deal
 * @param req - request object
 * @param res - response
 */
export const submitDealCancellation = (req: SubmitDealCancellationRequest, res: Response) => {
  try {
    // TODO: DTFS2-7298 - update cancellation in database
    // TODO: DTFS2-7490 - send email
    return res.status(HttpStatusCode.Ok).send();
  } catch (error) {
    const errorMessage = 'Failed to submit deal cancellation';
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
