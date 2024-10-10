import { AnyObject } from '@ukef/dtfs2-common';
import externalApi from '../../external-api/api';

export const sendEmail = async (templateId: string, sendToEmailAddress: string, emailVariables: AnyObject) => {
  try {
    await externalApi.sendEmail(templateId, sendToEmailAddress, emailVariables);
  } catch (error) {
    console.error('DTFS-Central API - Failed to send email %o', error);

    throw error;
  }
};
