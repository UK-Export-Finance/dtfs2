import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { PostSubmitDealCancellationPayload } from '../../middleware/validate-post-submit-deal-cancellation-payload';
import { DealCancellationService } from '../../services/deal-cancellation/deal-cancellation.service';

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
  const { dealId } = req.params;
  try {
    const auditDetails = generateTfmAuditDetails(req.user._id);

    await DealCancellationService.submitDealCancellation({ dealId, cancellation, auditDetails });

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
