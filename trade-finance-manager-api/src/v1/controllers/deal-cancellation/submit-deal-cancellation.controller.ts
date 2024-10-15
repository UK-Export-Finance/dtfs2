import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { PostSubmitDealCancellationPayload } from '../../middleware/validate-post-submit-deal-cancellation-payload';
import { sendDealCancellationEmail } from '../../services/deal-cancellation/send-deal-cancellation-email';

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
export const submitDealCancellation = async (req: SubmitDealCancellationRequest, res: Response) => {
  const cancellation = req.body;
  try {
    // TODO: DTFS2-7298 - update cancellation in database
    await sendDealCancellationEmail(cancellation);
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
