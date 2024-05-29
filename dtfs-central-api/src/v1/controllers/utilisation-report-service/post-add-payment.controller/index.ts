import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { PostAddPaymentPayload } from '../../../routes/middleware/payload-validation/validate-post-add-payment-payload';
import { addPaymentToUtilisationReport } from './helpers';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';

export type PostAddPaymentRequest = CustomExpressRequest<{
  reqBody: PostAddPaymentPayload;
}>;

export const postAddPayment = async (req: PostAddPaymentRequest, res: Response) => {
  const { reportId } = req.params;
  const { feeRecordIds, paymentCurrency, paymentAmount, datePaymentReceived, paymentReference, user } = req.body;

  try {
    const newPaymentDetails: NewPaymentDetails = {
      currency: paymentCurrency,
      amountReceived: paymentAmount,
      dateReceived: datePaymentReceived,
      paymentReference,
    };

    await addPaymentToUtilisationReport(parseInt(reportId), feeRecordIds, user, newPaymentDetails);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to add a new payment';
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(500).send(errorMessage);
  }
};
