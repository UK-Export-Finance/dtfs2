import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError, ApiErrorResponseBody, AUDIT_USER_TYPES, CustomExpressRequest, TfmDealCancellationResponse } from '@ukef/dtfs2-common';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { SubmitDealCancellationPayload } from '../../../routes/middleware/payload-validation/validate-post-deal-cancellation-payload';
import { DealCancellationService } from '../../../../services/tfm/deal-cancellation.service';

type SubmitTfmDealCancellationRequest = CustomExpressRequest<{
  reqBody: SubmitDealCancellationPayload;
}>;

type PostTfmDealCancellationResponse = Response<ApiErrorResponseBody | TfmDealCancellationResponse>;

/**
 * Submits the TFM deal cancellation object
 * @param req - The request object
 * @param res - The response object
 */
export const submitTfmDealCancellation = async (req: SubmitTfmDealCancellationRequest, res: PostTfmDealCancellationResponse) => {
  const { cancellation, auditDetails } = req.body;
  const { dealId } = req.params;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.TFM);

    const cancelDealResponse = await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

    return res.status(HttpStatusCode.Ok).send(cancelDealResponse);
  } catch (error) {
    console.error('Error submitting the deal cancellation:', error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when submitting the deal cancellation',
    });
  }
};
