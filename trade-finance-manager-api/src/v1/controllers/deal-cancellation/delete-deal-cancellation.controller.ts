import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import api from '../../api';

export type DeleteDealCancellationRequest = CustomExpressRequest<{
  params: {
    dealId: string;
  };
}>;

/**
 * Deletes the TFM deal cancellation object
 * @param req - The request object
 * @param res - The response object
 */
export const deleteDealCancellation = async (req: DeleteDealCancellationRequest, res: Response) => {
  const { dealId } = req.params;

  try {
    await api.deleteDealCancellation({
      dealId,
      auditDetails: generateTfmAuditDetails(req.user._id),
    });

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    const errorMessage = 'Failed to delete deal cancellation';
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
