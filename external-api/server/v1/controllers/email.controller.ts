/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import * as dotenv from 'dotenv';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { HEADERS, isGovNotifyMocked } from '@ukef/dtfs2-common';
import { MDM } from '../../constants';
import { getNowAsEpoch } from '../../helpers/date';

dotenv.config();

const referenceProxyUrl = process.env.EXTERNAL_API_URL;

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
  [String(MDM.GOV_UK_NOTIFY_KEY_HEADER_NAME)]: process.env.GOV_NOTIFY_API_KEY ?? '',
};

export const emailNotification = async (req: Request, res: Response) => {
  const { templateId, sendToEmailAddress, emailVariables }: { templateId: string; sendToEmailAddress: string; emailVariables: Record<string, string> } =
    req.body;

  // Add a unique reference to an email
  const reference = `${templateId}-${getNowAsEpoch()}`;

  const personalisation = emailVariables;

  console.info('Calling APIM MDM GovNotify API template id %s', templateId);

  /**
   * if the notifyKey is the same as the mockNotifyKey,
   * then we do not call the APIM MDM GovNotify API
   * and we return a mock 200 OK response
   * (in E2E tests to stop spamming of GovNotify API)
   */
  if (isGovNotifyMocked()) {
    console.info('⚠️ Mocking APIM MDM GovNotify API call ⚠️');
    return res.status(HttpStatusCode.Ok).send({});
  }

  const response: { status: number | undefined; data: unknown } = await axios({
    method: 'post',
    url: `${APIM_MDM_URL}v1/emails`,
    headers,
    data: {
      templateId,
      sendToEmailAddress,
      reference,
      personalisation,
    },
  }).catch((error: AxiosError) => {
    console.error('Error calling APIM MDM GovNotify API %o', error);
    return { status: error?.response?.status || HttpStatusCode.UnprocessableEntity, data: 'Failed to call MDM GovNotify API' };
  });

  if (!response) {
    console.error('Empty APIM MDM GovNotify API response');
    return res.status(HttpStatusCode.UnprocessableEntity).send({});
  }

  const { status, data } = response;

  return res.status(status || HttpStatusCode.UnprocessableEntity).send(data);
};

export const sendEmail = async (templateId: string, sendToEmailAddress: string, emailVariables: object) => {
  try {
    if (isGovNotifyMocked()) {
      console.info('Mocking APIM MDM GovNotify API call');
      return {};
    }

    const { data } = await axios({
      method: 'post',
      url: `${referenceProxyUrl}/email`,
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
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
