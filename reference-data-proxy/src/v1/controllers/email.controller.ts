import { Request, Response } from 'express';
import dotenv from 'dotenv';
const { NotifyClient } = require('notifications-node-client');
dotenv.config();

const notifyKey: any = process.env.GOV_NOTIFY_API_KEY;
const notifyClient = new NotifyClient(notifyKey);

export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { templateId, sendToEmailAddress, emailVariables } = req.body;

    console.log('Calling Notify API. templateId: ', templateId);

    const personalisation = emailVariables;

    const notifyResponse = await notifyClient
      .sendEmail(templateId, sendToEmailAddress, {
        personalisation,
        reference: null,
      })
      .then((response: any) => response)
      .catch((error: any) => {
        console.error('Error calling Notify API ', error.response.data, error.response.status);
        return { data: error.response.data, status: error.response.status };
      });

    const { status, data } = notifyResponse;

    return res.status(status).send(data);
  } catch (e) {
    console.error('Unable to send email', { e });
  }
  return res.status(422);
};
