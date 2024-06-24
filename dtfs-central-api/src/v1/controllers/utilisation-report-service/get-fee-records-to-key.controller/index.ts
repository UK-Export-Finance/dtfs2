import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ReportPeriod, SessionBank } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { ApiError, NotFoundError } from '../../../../errors';
import { FeeRecordToKey } from '../../../../types/fee-records';
import { mapToFeeRecordsToKey } from './helpers';

export type GetFeeRecordsToKeyResponseBody = {
  feeRecords: FeeRecordToKey[];
  reportId: number;
  bank: SessionBank;
  reportPeriod: ReportPeriod;
};

type GetFeeRecordsToKeyResponse = Response<GetFeeRecordsToKeyResponseBody | string>;

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
      feeRecords: feeRecordsToKey,
      reportId: id,
      bank: {
        id: bankId,
        name: bankName,
      },
      reportPeriod,
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
