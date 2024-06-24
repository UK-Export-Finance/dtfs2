import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ApiError, NotFoundError } from '../../../../errors';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { mapToEditPaymentDetails } from './helpers';
import { EditPaymentDetails } from '../../../../types/payments';

type GetEditPaymentDetailsResponse = Response<EditPaymentDetails | string>;

export const getEditPayment = async (req: Request, res: GetEditPaymentDetailsResponse) => {
  const { reportId, paymentId } = req.params;
  // const { includeFeeRecords } = req.query;

  try {
    const payment = await PaymentRepo.findOne({
      where: {
        id: Number(paymentId),
        feeRecords: {
          report: {
            id: Number(reportId),
          },
        },
      },
      relations: { feeRecords: { report: true } },
    });

    if (!payment) {
      throw new NotFoundError(`Failed to find a payment with id '${paymentId}' attached to report with id '${reportId}'`);
    }

    const editPaymentDetails = await mapToEditPaymentDetails(payment);

    return res.status(HttpStatusCode.Ok).send(editPaymentDetails);
  } catch (error) {
    const errorMessage = `Failed to get edit payment details`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
