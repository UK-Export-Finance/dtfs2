import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { ApiError, NotFoundError } from '../../../../errors';
import { UtilisationReportWithFeeRecordsToKey } from '../../../../types/utilisation-reports';
import { mapToFeeRecordsToKey } from './helpers';

type GetFeeRecordsToKeyResponse = Response<UtilisationReportWithFeeRecordsToKey | string>;

export const getFeeRecordsToKey = async (req: Request, res: GetFeeRecordsToKeyResponse) => {
  const { reportId } = req.params;

  try {
    const utilisationReport = await UtilisationReportRepo.findOneByIdWithFeeRecordsFilteredByStatusWithPayments(Number(reportId), ['MATCH']);
    if (!utilisationReport) {
      throw new NotFoundError(`Failed to find a report with id ${reportId}`);
    }

    const { id, bankId, reportPeriod, feeRecords } = utilisationReport;

    const bankName = await getBankNameById(bankId);
    if (!bankName) {
      throw new NotFoundError(`Failed to find a bank with id ${bankId}`);
    }

    const feeRecordsToKey = mapToFeeRecordsToKey(feeRecords);

    return res.status(HttpStatusCode.Ok).send({
      id,
      bank: {
        id: bankId,
        name: bankName,
      },
      reportPeriod,
      feeRecords: feeRecordsToKey,
    });
  } catch (error) {
    const errorMessage = 'Failed to generate keying data';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
