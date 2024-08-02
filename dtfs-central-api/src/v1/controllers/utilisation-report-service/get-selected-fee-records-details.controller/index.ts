import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { SelectedFeeRecordsDetails } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { NotFoundError, ApiError, InvalidPayloadError } from '../../../../errors';
import { validateSelectedFeeRecordsAllHaveSamePaymentCurrency } from '../../../validation/utilisation-report-service/selected-fee-record-validator';
import { canFeeRecordsBeAddedToExistingPayment, getAvailablePaymentGroups, mapToSelectedFeeRecordDetails } from './helpers';

type GetSelectedFeeRecordDetailsRequestBody = {
  feeRecordIds: number[];
};

export type GetSelectedFeeRecordDetailsRequest = CustomExpressRequest<{
  params: {
    id: string;
  };
  query: {
    includeAvailablePaymentGroups?: 'true' | 'false';
  };
  reqBody: GetSelectedFeeRecordDetailsRequestBody;
}>;

type ResponseBody = SelectedFeeRecordsDetails | string;

export const getSelectedFeeRecordDetails = async (req: GetSelectedFeeRecordDetailsRequest, res: Response<ResponseBody>) => {
  const { id: reportId } = req.params;
  const { includeAvailablePaymentGroups } = req.query;
  const selectedFeeRecordIds = req.body.feeRecordIds;

  try {
    if (selectedFeeRecordIds.length === 0) {
      throw new InvalidPayloadError('No fee records selected');
    }

    const utilisationReport = await UtilisationReportRepo.findOneByIdWithFeeRecordsFilteredByIdWithPayments(Number(reportId), selectedFeeRecordIds);

    if (!utilisationReport) {
      throw new NotFoundError(`Failed to find a report with id '${reportId}'`);
    }

    const selectedFeeRecords = utilisationReport.feeRecords;

    if (selectedFeeRecords.length !== selectedFeeRecordIds.length) {
      throw new InvalidPayloadError('All selected fee records must belong to the requested report');
    }

    validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords);

    const reportedPaymentCurrency = selectedFeeRecords[0].paymentCurrency;
    const availablePaymentGroups = includeAvailablePaymentGroups === 'true' ? await getAvailablePaymentGroups(reportId, reportedPaymentCurrency) : undefined;

    const canAddToExistingPayment = await canFeeRecordsBeAddedToExistingPayment(reportId, selectedFeeRecords);
    const selectedFeeRecordsDetails = await mapToSelectedFeeRecordDetails(
      utilisationReport.bankId,
      utilisationReport.reportPeriod,
      selectedFeeRecords,
      canAddToExistingPayment,
      availablePaymentGroups,
    );

    return res.status(HttpStatusCode.Ok).send(selectedFeeRecordsDetails);
  } catch (error) {
    const errorMessage = `Failed to get selected fee records details for report with id '${reportId}'`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
