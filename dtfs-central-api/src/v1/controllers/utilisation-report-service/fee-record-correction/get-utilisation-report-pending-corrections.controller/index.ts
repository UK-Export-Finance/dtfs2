import { AnyObject, ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { NotFoundError } from '../../../../../errors';
import { getBankById } from '../../../../../repositories/banks-repo';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';

export type GetUtilisationReportPendingCorrectionsRequest = CustomExpressRequest<{
  params: {
    bankId: string;
  };
}>;

type PendingCorrectionsResponseBody = {
  reportPeriod: string;
  uploadedByUser: string;
  uploadedAt: string;
  reportId: number;
  corrections: {
    feeRecordId: number;
    facilityId: string;
    reportedFees: string;
    date: string;
    reason: string;
    status: string;
  }[];
};

export type GetUtilisationReportPendingCorrectionsResponse = Response<null | PendingCorrectionsResponseBody | AnyObject | string>;

/**
 * Controller for the GET utilisation report pending corrections route.
 *
 * Fetches the pending fee record corrections for the oldest report for the bank with pending corrections.
 *
 * If there are no pending corrections for any reports for the bank, returns no content.
 * @param req - The request object
 * @param res - The response object
 */
export const getUtilisationReportPendingCorrectionsByBankId = async (
  req: GetUtilisationReportPendingCorrectionsRequest,
  res: GetUtilisationReportPendingCorrectionsResponse,
) => {
  try {
    const { bankId } = req.params;

    const bank = await getBankById(bankId);

    if (!bank) {
      throw new NotFoundError(`Failed to find bank with id '${bankId}'`);
    }

    if (!bank.isVisibleInTfmUtilisationReports) {
      throw new NotFoundError(`Bank with id '${bankId}' is not opted into utilisation reporting via DTFS`);
    }

    const oldestReportWithPendingCorrections = await UtilisationReportRepo.findOldestReportWithPendingCorrectionsByBankId(bankId);

    if (!oldestReportWithPendingCorrections) {
      return res.sendStatus(HttpStatusCode.NoContent);
    }

    return res.status(HttpStatusCode.Ok).send({ corrections: oldestReportWithPendingCorrections.feeRecords.flatMap((feeRecord) => feeRecord.corrections) });
  } catch (error) {
    const errorMessage = 'Failed to get pending corrections';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
