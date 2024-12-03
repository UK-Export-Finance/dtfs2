import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { PostRemoveFeesFromPaymentGroupPayload } from '../../../routes/middleware/payload-validation/validate-post-remove-fees-from-payment-group-payload';
import { InvalidPayloadError, NotFoundError } from '../../../../errors';
import { PaymentRepo } from '../../../../repositories/payment-repo';
import { removeFeesFromPaymentGroup } from './helpers';

export type PostRemoveFeesFromPaymentGroupRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    paymentId: string;
  };
  reqBody: PostRemoveFeesFromPaymentGroupPayload;
}>;

/**
 * Controller for the POST remove fees from payment group route
 * @param req - The request object
 * @param res - The response object
 */
export const postRemoveFeesFromPaymentGroup = async (req: PostRemoveFeesFromPaymentGroupRequest, res: Response) => {
  const { reportId, paymentId } = req.params;
  const { selectedFeeRecordIds, user } = req.body;

  try {
    const payment = await PaymentRepo.findOneByIdWithFeeRecordsAndReportFilteredById(Number(paymentId), Number(reportId));
    if (!payment) {
      throw new NotFoundError(`Failed to find a payment with id '${paymentId}' linked to report with id '${reportId}'.`);
    }

    const utilisationReport = payment.feeRecords.at(0)?.report;
    if (!utilisationReport) {
      throw new Error('The found payment does not have a defined report in the feeRecords.');
    }

    const allFeeRecords = payment.feeRecords;
    const feeRecordsToRemove = allFeeRecords.filter((record) => selectedFeeRecordIds.includes(record.id));
    const otherFeeRecordsInGroup = allFeeRecords.filter((record) => !selectedFeeRecordIds.includes(record.id));

    if (feeRecordsToRemove.length === 0) {
      throw new InvalidPayloadError('No fee records selected that belong to the payment group.');
    }

    if (otherFeeRecordsInGroup.length === 0) {
      throw new InvalidPayloadError('Not all fee records can be selected.');
    }

    await removeFeesFromPaymentGroup(utilisationReport, feeRecordsToRemove, otherFeeRecordsInGroup, user);
    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = `Failed to remove fees from payment with id ${paymentId}`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
