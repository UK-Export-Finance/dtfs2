/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import * as dotenv from 'dotenv';
import axios from 'axios';
import { Request, Response } from 'express';
import { getNowAsEpoch } from '../../helpers/date';

const { NotifyClient } = require('notifications-node-client'); // eslint-disable-line @typescript-eslint/no-var-requires

dotenv.config();

const referenceProxyUrl = process.env.EXTERNAL_API_URL;
const notifyKey: any = process.env.GOV_NOTIFY_API_KEY;
const notifyClient = new NotifyClient(notifyKey);

export const emailNotification = async (req: Request, res: Response) => {
  try {
    const { templateId, sendToEmailAddress, emailVariables } = req.body;
    // Add a unique reference to an email
    const reference = `${templateId}-${getNowAsEpoch()}`;

    console.info('Calling Notify API. templateId %s', templateId);

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
  } catch (error) {
    console.error('Unable to send email %o', error);
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
  } catch (error) {
    console.error('Unable to send the email %o', error);
    return null;
  }
};
