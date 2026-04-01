/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import dotenv from 'dotenv';
import axios, { HttpStatusCode } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { sendEmail } from '../../server/v1/controllers/email.controller';
import { app } from '../../server/createApp';
import { api } from '../api';

dotenv.config();

const { APIM_MDM_URL, EXTERNAL_API_URL, MOCK_E2E_GOV_NOTIFY_API_KEY } = process.env;

const originalProcessEnv = { ...process.env };

const { post } = api(app);

const mockSuccessfulResponse = {
  status: HttpStatusCode.Created,
  data: {
    content: {
      body: 'Dear John Smith,\r\n\r\nThe status of your MIA for EuroStar has been updated.\r\n\r\nEmail: test@test.gov.uk\r\nPhone: +44 (0)202 123 4567\r\nOpening times: Monday to Friday, 9am to 5pm (excluding public holidays)',
      from_email: 'test@notifications.service.gov.uk',
      subject: 'Status update: EuroStar bridge',
      unsubscribe_link: null,
    },
    id: 'efd12345-1234-5678-9012-ee123456789f',
    reference: 'tmp1234-1234-5678-9012-abcd12345678-17133465334678',
    scheduled_for: null,
    template: {
      id: 'tmp1234-1234-5678-9012-abcd12345678',
      uri: 'https://api.notifications.service.gov.uk/services/abc12345-a123-4567-8901-123456789012/templates/tmp1234-1234-5678-9012-abcd12345678',
      version: 24,
    },
    uri: 'https://api.notifications.service.gov.uk/v2/notifications/efd12345-1234-5678-9012-ee123456789f',
  },
};

// Mock Axios
const axiosMock = new MockAdapter(axios);

const mockBody = {
  templateId: 'tmp1234-1234-5678-9012-abcd12345678',
  sendToEmailAddress: 'test@testing.com',
  emailVariables: {
    name: 'Testing',
  },
};

describe('/email', () => {
  beforeEach(() => {
    process.env = { ...originalProcessEnv };
  });

  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  describe('POST /v1/email', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it(`should return ${HttpStatusCode.Created} response from MDM GovNotify API`, async () => {
      axiosMock.onPost(`${APIM_MDM_URL}v1/emails`).reply(HttpStatusCode.Created, mockSuccessfulResponse.data);

      const { status, body } = await post(mockBody).to('/email');

      expect(status).toEqual(mockSuccessfulResponse.status);
      expect(body).toEqual(mockSuccessfulResponse.data);
    });

    it('should return error status from MDM GovNotify API if error message is missing', async () => {
      const unknown500Status = Math.floor(Math.random() * 50 + 500);
      axiosMock.onPost(`${APIM_MDM_URL}v1/emails`).reply(unknown500Status, '');

      const { status, body } = await post(mockBody).to('/email');

      expect(status).toEqual(unknown500Status);
      expect(body).toEqual({});
    });

    it('should return error status from MDM GovNotify API if error message provided', async () => {
      const errorMessage = 'an error message';
      const unknown500Status = Math.floor(Math.random() * 50) + 500;
      axiosMock.onPost(`${APIM_MDM_URL}v1/emails`).reply(unknown500Status, errorMessage);

      const { status, body } = await post(mockBody).to('/email');

      expect(status).toEqual(unknown500Status);
      expect(body).toEqual({});
    });

    describe('when GOV_NOTIFY_API_KEY is set to MOCK_E2E_GOV_NOTIFY_API_KEY', () => {
      beforeEach(() => {
        process.env.GOV_NOTIFY_API_KEY = MOCK_E2E_GOV_NOTIFY_API_KEY;
      });

      it(`should return ${HttpStatusCode.Ok} response`, async () => {
        process.env.GOV_NOTIFY_API_KEY = MOCK_E2E_GOV_NOTIFY_API_KEY;

        const { status, body } = await post(mockBody).to('/email');

        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body).toEqual({});
      });
    });

    describe('when MOCK_E2E_GOV_NOTIFY_API_KEY is undefined', () => {
      it(`should return ${HttpStatusCode.Created} response from MDM GovNotify API`, async () => {
        process.env.MOCK_E2E_GOV_NOTIFY_API_KEY = undefined;
        axiosMock.onPost(`${APIM_MDM_URL}v1/emails`).reply(HttpStatusCode.Created, mockSuccessfulResponse.data);

        const { status, body } = await post(mockBody).to('/email');

        expect(status).toEqual(mockSuccessfulResponse.status);
        expect(body).toEqual(mockSuccessfulResponse.data);
      });
    });

    describe('when MOCK_E2E_GOV_NOTIFY_API_KEY is an empty string', () => {
      it(`should return ${HttpStatusCode.Created} response from MDM GovNotify API`, async () => {
        process.env.MOCK_E2E_GOV_NOTIFY_API_KEY = '';
        axiosMock.onPost(`${APIM_MDM_URL}v1/emails`).reply(HttpStatusCode.Created, mockSuccessfulResponse.data);

        const { status, body } = await post(mockBody).to('/email');

        expect(status).toEqual(mockSuccessfulResponse.status);
        expect(body).toEqual(mockSuccessfulResponse.data);
      });
    });
  });

  describe('sendEmail', () => {
    it('should return 201 response from MDM GovNotify API', async () => {
      axiosMock.onPost(`${EXTERNAL_API_URL}/email`).reply(HttpStatusCode.Created, mockSuccessfulResponse.data);

      const response = await sendEmail(mockBody.templateId, mockBody.sendToEmailAddress, mockBody.emailVariables);

      expect(response).toEqual(mockSuccessfulResponse.data);
    });

    it('should return null in case of error', async () => {
      axiosMock.onPost(`${EXTERNAL_API_URL}/email`).reply(HttpStatusCode.Forbidden);

      const response = await sendEmail(mockBody.templateId, mockBody.sendToEmailAddress, mockBody.emailVariables);

      expect(response).toBeNull();
    });
  });
});
