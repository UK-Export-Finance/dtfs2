import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { PostSubmitDealCancellationPayload } from '../../middleware/validate-post-submit-deal-cancellation-payload';
import { sendDealCancellationEmail } from '../../services/deal-cancellation/send-deal-cancellation-email';
import * as api from '../../api';

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
    // TODO: DTFS2-7298 - update cancellation in database & return cancelled deal/facility ids
    const {
      dealSnapshot: { ukefDealId },
    } = await api.findOneDeal(dealId);
    const facilities = await api.findFacilitiesByDealId(dealId);

    const ukefFacilityIds = facilities.map((facility) => facility.facilitySnapshot.ukefFacilityId).filter((id) => id !== null);

    await sendDealCancellationEmail(ukefDealId, cancellation, ukefFacilityIds);
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
