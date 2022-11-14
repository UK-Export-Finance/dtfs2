import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
const { NotifyClient } = require('notifications-node-client'); // eslint-disable-line @typescript-eslint/no-var-requires
import axios from 'axios';

dotenv.config();

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;
const notifyKey: any = process.env.GOV_NOTIFY_API_KEY;
const notifyClient = new NotifyClient(notifyKey);

export const emailNotification = async (req: Request, res: Response) => {
  try {
    const { templateId, sendToEmailAddress, emailVariables } = req.body;
    // Add a unique reference to an email
    const reference = `${templateId}-${new Date().valueOf()}`;

    console.info('Calling Notify API. templateId: ', templateId);

    const personalisation = emailVariables;

    const notifyResponse = await notifyClient
      .sendEmail(templateId, sendToEmailAddress, {
        personalisation,
        reference,
      })
      .then((response: any) => response);

    if (!notifyResponse) {
      return res.status(422).send({});
    }

    const { status, data } = notifyResponse;

    return res.status(status).send(data);
  } catch (e) {
    console.error('Unable to send email', { e });
  }
  return res.status(422).send({});
};

export const sendEmail = async (templateId: string, sendToEmailAddress: string, emailVariables: object) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: `${referenceProxyUrl}/email`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        templateId,
        sendToEmailAddress,
        emailVariables,
      },
    });
    return data;
  } catch (err) {
    console.error(`Unable to send the email: ${err}`);
    return null;
  }
};
