import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { InvalidPayloadError, NotFoundError } from '../../../../errors';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { addFeesToAnExistingPaymentGroup } from './helpers';
import { PostAddFeesToAnExistingPaymentGroupPayload } from '../../../routes/middleware/payload-validation';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import {
  validateThatAllSelectedFeeRecordsAndPaymentGroupHaveSameCurrency,
  validateThatPaymentGroupHasFeeRecords,
  validateThatRequestedPaymentsMatchSavedPayments,
} from '../../../validation/utilisation-report-service/payment-group-validator';

export type PostAddFeesToAnExistingPaymentGroupRequest = CustomExpressRequest<{
  params: {
    reportId: string;
  };
  reqBody: PostAddFeesToAnExistingPaymentGroupPayload;
}>;

/**
 * Controller for the POST fees to an existing payment group route
 * @param req - The request object
 * @param res - The response object
 */
export const postAddFeesToAnExistingPaymentGroup = async (req: PostAddFeesToAnExistingPaymentGroupRequest, res: Response) => {
  const { reportId } = req.params;
  const { feeRecordIds, paymentIds: requestedPaymentIds, user } = req.body;

  try {
    const payments = await PaymentRepo.findPaymentsInGroupByPaymentIdAndReportIdWithFeeRecords(requestedPaymentIds[0], Number(reportId));
    if (payments.length === 0) {
      throw new NotFoundError('No payments found for the given payment IDs.');
    }

    validateThatRequestedPaymentsMatchSavedPayments(payments, requestedPaymentIds);

    const existingPaymentGroupFeeRecords = payments[0].feeRecords;
    validateThatPaymentGroupHasFeeRecords(existingPaymentGroupFeeRecords);

    const selectedFeeRecords = await FeeRecordRepo.findByIdAndReportIdWithReport(feeRecordIds, Number(reportId));

    const paymentGroupCurrency = payments[0].currency;
    validateThatAllSelectedFeeRecordsAndPaymentGroupHaveSameCurrency(selectedFeeRecords, paymentGroupCurrency);

    const feeRecordsToAdd = selectedFeeRecords.filter(
      (record) => !existingPaymentGroupFeeRecords.some((paymentFeeRecord) => paymentFeeRecord.id === record.id),
    );
    if (feeRecordsToAdd.length === 0) {
      throw new InvalidPayloadError('Cannot add fees to the payment group they are already in.');
    }

    const utilisationReport = existingPaymentGroupFeeRecords.at(0)?.report;
    if (!utilisationReport) {
      throw new Error('The found payment group does not have a defined report in the feeRecords.');
    }

    await addFeesToAnExistingPaymentGroup(utilisationReport, feeRecordsToAdd, existingPaymentGroupFeeRecords, payments, user);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = `Failed to add fees to an existing payment group`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
