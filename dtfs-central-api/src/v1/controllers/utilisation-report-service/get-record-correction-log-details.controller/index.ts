import { Request } from 'express';
import { HttpStatusCode } from 'axios';
import { GetRecordCorrectionLogDetailsResponse } from '@ukef/dtfs2-common';
import { FeeRecordCorrectionRepo } from '../../../../repositories/fee-record-correction-repo';
import { getRecordCorrectionFields } from '../helpers/get-record-correction-fields';
import { getBankNameById } from '../../../../repositories/banks-repo';

/**
 * gets record correction log details by id
 * finds the correction and fee record and report by correction id
 * returns the formatted fields for the record correction and fee record
 * @param req - The request object
 * @param res - The response object
 * @returns formatted fields for the record correction and fee record
 */
export const getRecordCorrectionLogDetails = async (req: Request, res: GetRecordCorrectionLogDetailsResponse) => {
  const { correctionId: correctionIdString } = req.params;

  const correctionId = Number(correctionIdString);

  const response = await FeeRecordCorrectionRepo.findOneByIdWithFeeRecordAndReport(correctionId);

  if (!response || !response?.feeRecord || !response?.feeRecord?.report) {
    return res.status(HttpStatusCode.NotFound).send('Record correction not found');
  }

  const bankName = await getBankNameById(response.feeRecord.report.bankId);

  if (!bankName?.length) {
    return res.status(HttpStatusCode.NotFound).send('Bank not found');
  }

  const fields = getRecordCorrectionFields(response.feeRecord, response);

  const responseObject = {
    fields,
    bankName,
    reportPeriod: response.feeRecord.report.reportPeriod,
  };

  return res.status(HttpStatusCode.Ok).send(responseObject);
};
