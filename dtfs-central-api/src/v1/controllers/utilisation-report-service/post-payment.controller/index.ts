import { ApiError, FeeRecordStatus } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { PostPaymentPayload } from '../../../routes/middleware/payload-validation/validate-post-payment-payload';
import { addPaymentToUtilisationReport } from './helpers';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

export type PostPaymentRequest = CustomExpressRequest<{
  reqBody: PostPaymentPayload;
}>;

export type PostPaymentResponseBody = {
  feeRecordStatus: FeeRecordStatus;
};

export type PostPaymentResponse = Response<PostPaymentResponseBody>;

/**
 * Controller for the POST add a payment route
 * @param req - The request object
 * @param res - The response object
 */
export const postPayment = async (req: PostPaymentRequest, res: Response) => {
  const { reportId } = req.params;
  const { feeRecordIds, paymentCurrency, paymentAmount, datePaymentReceived, paymentReference, user } = req.body;

  try {
    const newPaymentDetails: NewPaymentDetails = {
      currency: paymentCurrency,
      amount: paymentAmount,
      dateReceived: datePaymentReceived,
      reference: paymentReference,
    };

    await addPaymentToUtilisationReport(parseInt(reportId, 10), feeRecordIds, user, newPaymentDetails);
    const { status } = await FeeRecordRepo.findOneByOrFail({ id: feeRecordIds[0] });

    return res.status(HttpStatusCode.Ok).send({ feeRecordStatus: status });
  } catch (error) {
    const errorMessage = 'Failed to add a new payment';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(500).send(errorMessage);
  }
};
