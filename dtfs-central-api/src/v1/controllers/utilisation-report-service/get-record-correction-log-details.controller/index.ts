import { Request } from 'express';
import { HttpStatusCode } from 'axios';
import { GetRecordCorrectionLogDetailsResponse } from '@ukef/dtfs2-common';
import { FeeRecordCorrectionRepo } from '../../../../repositories/fee-record-correction-repo';
import { getRecordCorrectionFields } from '../helpers/get-record-correction-fields';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { ApiError, NotFoundError } from '../../../../errors';

/**
 * gets record correction log details by id
 * finds the correction and fee record and report by correction id
 * returns the formatted fields for the record correction and fee record
 * @param req - The request object
 * @param res - The response object
 * @returns formatted fields for the record correction and fee record
 */
export const getRecordCorrectionLogDetails = async (req: Request, res: GetRecordCorrectionLogDetailsResponse) => {
  try {
    const { correctionId: correctionIdString } = req.params;

    const correctionId = Number(correctionIdString);

    const correction = await FeeRecordCorrectionRepo.findOneByIdWithFeeRecordAndReport(correctionId);

    if (!correction || !correction?.feeRecord || !correction?.feeRecord?.report) {
      throw new NotFoundError('Record correction not found');
    }

    const bankName = await getBankNameById(correction.feeRecord.report.bankId);

    if (!bankName) {
      throw new NotFoundError('Bank not found');
    }

    const {
      facilityId,
      exporter,
      formattedReasons,
      formattedDateSent,
      formattedOldRecords,
      formattedCorrectRecords,
      bankTeamName,
      isCompleted,
      formattedBankTeamEmails,
      additionalInfo,
      formattedBankCommentary,
      formattedDateReceived,
      formattedRequestedByUser,
    } = getRecordCorrectionFields(correction.feeRecord, correction);

    const responseObject = {
      correctionDetails: {
        facilityId,
        exporter,
        formattedReasons,
        formattedDateSent,
        formattedOldRecords,
        formattedCorrectRecords,
        bankTeamName,
        isCompleted,
        formattedBankTeamEmails,
        additionalInfo,
        formattedBankCommentary,
        formattedDateReceived,
        formattedRequestedByUser,
      },
      bankName,
      reportPeriod: correction.feeRecord.report.reportPeriod,
    };

    return res.status(HttpStatusCode.Ok).send(responseObject);
  } catch (error) {
    const errorMessage = `Failed to get record correction log details`;
    console.error('%s %o', errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
