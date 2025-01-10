import { ApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest } from '../../../../../types/custom-express-request';
import { NotFoundError } from '../../../../../errors';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { PutFeeRecordCorrectionPayload } from '../../../../routes/middleware/payload-validation';
import { getBankById } from '../../../../../repositories/banks-repo';

export type PutFeeRecordCorrectionRequest = CustomExpressRequest<{
  params: {
    bankId: string;
    correctionId: string;
  };
  reqBody: PutFeeRecordCorrectionPayload;
}>;

/**
 * Controller for the PUT fee record correction route.
 *
 * - Fetches the fee record correction transient form data for the
 * requesting user and correction id combination.
 * - Updates the fee record with the corrected values and sets the
 * status back to TO_DO.
 * - Saves the old and new values against the record correction for
 * record correction history log.
 * - Sends confirmation email to the bank payment report officer team.
 * - Sends notification email to PDC team.
 *
 * @param req - The {@link PutFeeRecordCorrectionRequest} request object
 * @param res - The response object
 */
export const putFeeRecordCorrection = async (req: PutFeeRecordCorrectionRequest, res: Response) => {
  try {
    const { correctionId: correctionIdString, bankId } = req.params;
    const { user } = req.body;

    const correctionId = Number(correctionIdString);
    const userId = user.id;

    const correction = await FeeRecordCorrectionRepo.findOneByIdAndBankIdWithFeeRecordAndReport(correctionId, bankId);

    if (!correction) {
      throw new NotFoundError(`Failed to find a correction with id '${correctionId}' for bank id '${bankId}'`);
    }

    const transientFormData = await FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndCorrectionId(userId, correctionId);

    if (!transientFormData) {
      throw new NotFoundError(`Failed to find transient form data with user id '${userId}' for correction id '${correctionId}'`);
    }

    const bank = await getBankById(bankId);

    if (!bank) {
      throw new NotFoundError(`Failed to find bank with id '${bankId}'`);
    }

    // TODO: FN-3675 - apply the correction to the fee record and send confirmation emails

    const { reportPeriod } = correction.feeRecord.report;

    const { emails: paymentOfficerEmails } = bank.paymentOfficerTeam;

    return res.status(HttpStatusCode.Ok).send({ sentToEmails: paymentOfficerEmails, reportPeriod });
  } catch (error) {
    const errorMessage = 'Failed to put fee record correction';
    console.error('%s %o', errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
