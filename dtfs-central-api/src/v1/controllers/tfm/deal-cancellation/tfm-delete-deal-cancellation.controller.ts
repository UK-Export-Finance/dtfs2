import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError, ApiErrorResponseBody, AUDIT_USER_TYPES, CustomExpressRequest } from '@ukef/dtfs2-common';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { UpdateResult } from 'mongodb';
import { TfmDealCancellationRepo } from '../../../../repositories/tfm-deals-repo';
import { DeleteDealCancellationPayload } from '../../../routes/middleware/payload-validation/validate-delete-deal-cancellation-payload';

type DeleteTfmDealCancellationRequest = CustomExpressRequest<{
  reqBody: DeleteDealCancellationPayload;
}>;

type DeleteTfmDealCancellationResponse = Response<ApiErrorResponseBody | UpdateResult>;

/**
 * Deletes the TFM deal cancellation object
 * @param req - The request object
 * @param res - The response object
 */
export const deleteTfmDealCancellation = async (req: DeleteTfmDealCancellationRequest, res: DeleteTfmDealCancellationResponse) => {
  const { auditDetails } = req.body;
  const { dealId } = req.params;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.TFM);

    await TfmDealCancellationRepo.deleteOneDealCancellation(dealId, auditDetails);

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    console.error('Error deleting deal cancellation:', error);
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }
    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when updating the deal cancellation object',
    });
  }
};
