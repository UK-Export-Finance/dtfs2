import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { InvalidPayloadError } from '../../../../errors';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { addFeesToAnExistingPaymentGroup, ensureAllPaymentsHaveSameFeeRecords, ensurePaymentIdsMatchFirstFeeRecordPaymentIds } from './helpers';
import { PostFeesToAnExistingPaymentGroupPayload } from '../../../routes/middleware/payload-validation';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

export type PostFeesToAnExistingPaymentGroupRequest = CustomExpressRequest<{
  params: {
    reportId: string;
  };
  reqBody: PostFeesToAnExistingPaymentGroupPayload;
}>;

/**
 * Controller for the POST fees to an existing payment group route
 * @param req - The request object
 * @param res - The response object
 */
export const postFeesToAnExistingPaymentGroup = async (req: PostFeesToAnExistingPaymentGroupRequest, res: Response) => {
  const { reportId } = req.params;
  const { feeRecordIds, paymentIds, user } = req.body;

  try {
    const payments = await PaymentRepo.findByIdWithFeeRecordsAndReportAndPaymentsFilteredById(paymentIds, Number(reportId));
    if (payments.length === 0) {
      throw new InvalidPayloadError('No payments found for the given payment IDs.');
    }

    ensureAllPaymentsHaveSameFeeRecords(payments);
    ensurePaymentIdsMatchFirstFeeRecordPaymentIds(payments, paymentIds);

    const existingFeeRecordsInPaymentGroup = payments.at(0)?.feeRecords;
    if (!existingFeeRecordsInPaymentGroup || existingFeeRecordsInPaymentGroup.length === 0) {
      throw new InvalidPayloadError('No fee records belong to the payment group.');
    }

    const selectedFeeRecords = await FeeRecordRepo.findByIdAndReportIdWithReport(feeRecordIds, Number(reportId));
    const feeRecordsToAdd = selectedFeeRecords.filter(
      (record) => !existingFeeRecordsInPaymentGroup.some((paymentFeeRecord) => paymentFeeRecord.id === record.id),
    );

    if (feeRecordsToAdd.length === 0) {
      throw new InvalidPayloadError("No fee records selected that don't belong to the payment group.");
    }

    const utilisationReport = existingFeeRecordsInPaymentGroup.at(0)?.report;
    if (!utilisationReport) {
      throw new Error('The found payment group does not have a defined report in the feeRecords.');
    }

    await addFeesToAnExistingPaymentGroup(utilisationReport, feeRecordsToAdd, existingFeeRecordsInPaymentGroup, payments, user);
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
