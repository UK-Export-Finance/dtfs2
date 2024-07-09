import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { PostRemoveFeesFromPaymentPayload } from '../../../routes/middleware/payload-validation/validate-post-remove-fees-from-payment-payload';

export type PostRemoveFeesFromPaymentRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    paymentId: string;
  };
  reqBody: PostRemoveFeesFromPaymentPayload;
}>;

/**
 * Controller for the POST remove fees from payment route
 * @param req - The request object
 * @param res - The response object
 */
export const postRemoveFeesFromPayment = (req: PostRemoveFeesFromPaymentRequest, res: Response) => {
  const { paymentId } = req.params;

  const errorMessage = `Failed to remove fees from payment with id ${paymentId}`;
  return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
};
