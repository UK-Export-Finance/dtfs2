import { AnyObject } from '@ukef/dtfs2-common';
import { Response } from 'express';
import externalApi from '../../external-api/api';

export const sendEmail = async (templateId: string, sendToEmailAddress: string, emailVariables: AnyObject) => {
  try {
    if (!templateId) {
      return { status: 400, data: 'Missing parameter templateId' };
    }
    if (!sendToEmailAddress) {
      return { status: 400, data: 'Missing parameter sendToEmailAddress' };
    }
    if (!emailVariables) {
      return { status: 400, data: 'Missing parameter emailVariables' };
    }

    const emailSent = (await externalApi.sendEmail(templateId, sendToEmailAddress, emailVariables)) as Response;

    return emailSent;
  } catch (error) {
    console.error('Portal API - Failed to send email %o', error);
    return { status: 500, data: 'Failed to send an email' };
  }
};
