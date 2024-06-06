import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { SelectedFeeRecordsDetails } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { NotFoundError, ApiError, InvalidPayloadError } from '../../../../errors';
import { validateSelectedFeeRecordsAllHaveSamePaymentCurrency } from '../../../validation/utilisation-report-service/selected-fee-record-validator';
import { mapToSelectedFeeRecordDetails } from './helpers';

type GetSelectedFeeRecordDetailsRequestBody = {
  feeRecordIds: number[];
};

export type GetSelectedFeeRecordDetailsRequest = CustomExpressRequest<{
  params: {
    id: string;
  };
  reqBody: GetSelectedFeeRecordDetailsRequestBody;
}>;

type ResponseBody = SelectedFeeRecordsDetails | string;

export const getSelectedFeeRecordDetails = async (req: GetSelectedFeeRecordDetailsRequest, res: Response<ResponseBody>) => {
  const { id: reportId } = req.params;
  const selectedFeeRecordIds = req.body.feeRecordIds;

  try {
    if (selectedFeeRecordIds.length === 0) {
      throw new InvalidPayloadError('No fee records selected');
    }

    const utilisationReport = await UtilisationReportRepo.findOne({
      where: { id: Number(reportId) },
      relations: { feeRecords: { payments: true } },
    });

    if (!utilisationReport) {
      throw new NotFoundError(`Failed to find a report with id '${reportId}'`);
    }

    const selectedFeeRecords = utilisationReport.feeRecords.filter((feeRecord) => selectedFeeRecordIds.includes(feeRecord.id));

    if (selectedFeeRecords.length !== selectedFeeRecordIds.length) {
      throw new InvalidPayloadError('All selected fee records must belong to the requested report');
    }

    validateSelectedFeeRecordsAllHaveSamePaymentCurrency(selectedFeeRecords);
    const selectedFeeRecordsDetails = await mapToSelectedFeeRecordDetails(utilisationReport.bankId, utilisationReport.reportPeriod, selectedFeeRecords);

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
