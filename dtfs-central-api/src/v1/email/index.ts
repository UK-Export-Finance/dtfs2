import { AnyObject, ApiError } from '@ukef/dtfs2-common';
import { Response } from 'express';
import externalApi from '../../external-api/api';
import { NotFoundError, TransactionFailedError } from '../../errors';

export const sendEmail = async (templateId: string, sendToEmailAddress: string, emailVariables: AnyObject) => {
  try {
    if (!templateId) {
      throw new NotFoundError('Missing parameter templateId');
    }
    if (!sendToEmailAddress) {
      throw new NotFoundError('Missing parameter sendToEmailAddress');
    }
    if (!emailVariables) {
      throw new NotFoundError('Missing parameter emailVariables');
    }

    const emailSent = (await externalApi.sendEmail(templateId, sendToEmailAddress, emailVariables)) as Response;

    return emailSent;
  } catch (error) {
    console.error('Portal API - Failed to send email %o', error);
    if (error instanceof ApiError) {
      throw TransactionFailedError.forApiError(error);
    }
    if (error instanceof Error) {
      throw TransactionFailedError.forError(error);
    }
    throw TransactionFailedError.forUnknownError();
  }
};
