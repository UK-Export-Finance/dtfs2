import { Response } from 'express';
import { flatten } from 'mongo-dot-notation';
import { HttpStatusCode } from 'axios';
import { ApiError, ApiErrorResponseBody, AUDIT_USER_TYPES, CustomExpressRequest } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { UpdateResult } from 'mongodb';
import { TfmDealCancellationRepo } from '../../../../repositories/tfm-deals-repo';
import { PutDealCancellationPayload } from '../../../routes/middleware/payload-validation';

type UpdateTfmDealCancellationRequest = CustomExpressRequest<{
  reqBody: PutDealCancellationPayload;
}>;

type UpdateTfmDealCancellationResponse = Response<ApiErrorResponseBody | UpdateResult>;

export const updateTfmDealCancellation = async (req: UpdateTfmDealCancellationRequest, res: UpdateTfmDealCancellationResponse) => {
  const { dealCancellationUpdate, auditDetails } = req.body;
  const { dealId } = req.params;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.TFM);

    const updateResult = await TfmDealCancellationRepo.updateOneDealCancellation(
      dealId,
      flatten({
        'tfm.cancellation': dealCancellationUpdate,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      }),
    );

    return res.status(HttpStatusCode.Ok).json(updateResult);
  } catch (error) {
    console.error('Error updating deal cancellation:', error);
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }
    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error',
    });
  }
};
