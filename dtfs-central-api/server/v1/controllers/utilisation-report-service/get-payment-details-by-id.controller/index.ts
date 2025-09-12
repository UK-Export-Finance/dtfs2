import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CurrencyAndAmount, CustomExpressRequest, ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { ApiError, NotFoundError } from '../../../../errors';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { mapToPaymentDetails } from './helpers';
import { Payment } from '../../../../types/payments';
import { FeeRecord } from '../../../../types/fee-records';

type GetPaymentDetailsByIdRequest = CustomExpressRequest<{
  query: {
    includeFeeRecords?: 'true' | 'false';
  };
}>;

export type GetPaymentDetailsResponseBody = {
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  payment: Payment;
} & (
  | {
      feeRecords: FeeRecord[];
      totalReportedPayments: CurrencyAndAmount;
    }
  | {
      feeRecords?: undefined;
      totalReportedPayments?: undefined;
    }
);

type GetPaymentDetailsByIdResponse = Response<GetPaymentDetailsResponseBody | string>;

export const getPaymentDetailsById = async (req: GetPaymentDetailsByIdRequest, res: GetPaymentDetailsByIdResponse) => {
  const { reportId, paymentId } = req.params;
  const { includeFeeRecords } = req.query;

  try {
    const payment = await PaymentRepo.findOneByIdWithFeeRecordsAndReportFilteredById(Number(paymentId), Number(reportId));

    if (!payment) {
      throw new NotFoundError(`Failed to find a payment with id '${paymentId}' attached to report with id '${reportId}'`);
    }

    const paymentDetails = await mapToPaymentDetails(payment, includeFeeRecords === 'true');

    return res.status(HttpStatusCode.Ok).send(paymentDetails);
  } catch (error) {
    const errorMessage = `Failed to get payment details`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
