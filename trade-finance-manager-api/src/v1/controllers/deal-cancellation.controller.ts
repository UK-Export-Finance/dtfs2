import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest, TfmDealCancellation } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { UpdateResult } from 'mongodb';
import api from '../api';

export type UpdateDealCancellationRequest = CustomExpressRequest<{
  params: {
    dealId: string;
  };
  reqBody: TfmDealCancellation;
}>;

export const updateDealCancellation = async (req: UpdateDealCancellationRequest, res: Response) => {
  const { dealId } = req.params;

  try {
    const dealCancellation: UpdateResult = api.updateDealCancellation({
      dealId,
      dealCancellationUpdate: req.body,
      auditDetails: generateTfmAuditDetails(req.user._id),
    });

    return res.status(HttpStatusCode.Ok).send(dealCancellation);
  } catch (error) {
    const errorMessage = 'Failed to update deal cancellation';
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
