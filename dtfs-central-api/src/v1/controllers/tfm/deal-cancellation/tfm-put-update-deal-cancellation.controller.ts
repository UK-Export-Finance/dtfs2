import { Response } from 'express';
import { flatten } from 'mongo-dot-notation';
import { getUnixTime } from 'date-fns';
import { HttpStatusCode } from 'axios';
import { ApiError, ApiErrorResponseBody, AUDIT_USER_TYPES, CustomExpressRequest } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails, validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { TfmDealCancellationRepo } from '../../../../repositories/tfm-deals-repo';
import { PutDealCancellationPayload } from '../../../routes/middleware/payload-validation';

type UpdateTfmDealCancellationRequest = CustomExpressRequest<{
  reqBody: PutDealCancellationPayload;
}>;

type UpdateTfmDealCancellationResponse = Response<ApiErrorResponseBody | Document | null>;

export const updateTfmDealCancellation = async (req: UpdateTfmDealCancellationRequest, res: UpdateTfmDealCancellationResponse) => {
  const { payload, auditDetails } = req.body;
  const { dealId } = req.params;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.TFM);

    const dealCancellationUpdate = { ...payload, updatedAt: getUnixTime(new Date()) };

    await TfmDealCancellationRepo.updateOneDealWithCancellation(
      dealId,
      flatten({
        'tfm.cancellation$': dealCancellationUpdate,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      }),
    );

    const updatedDealCancellation = await TfmDealCancellationRepo.findTfmDealById(dealId);
    return res.status(HttpStatusCode.Ok).json(updatedDealCancellation);
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
