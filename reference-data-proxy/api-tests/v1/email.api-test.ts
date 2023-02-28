import { app } from '../../src/createApp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { post } = require('../api')(app);
const mockResponse = {
  status: 200,
  data: {
    content: {
      body: {},
    },
    id: '1234',
    template: {},
  },
};

jest.mock('notifications-node-client', () => {
  class MockNotifyClient {
    // eslint-disable-next-line @typescript-eslint/ban-types
    sendEmail: () => Promise<{ status: number; data: { content: { body: {} }; id: string; template: {} } }>;

    constructor() {
      this.sendEmail = async () => Promise.resolve(mockResponse);
    }
  }

  return {
    NotifyClient: MockNotifyClient,
  };
});

describe('/email', () => {
  describe('POST /v1/email', () => {
    it('should return response from notify api', async () => {
      const mockBody = {
        templateId: '1234',
        sendToEmailAddress: 'test@testing.com',
        emailVariables: {
          name: 'Testing',
        },
      };

      const { status, body } = await post(mockBody).to('/email');

      expect(status).toEqual(mockResponse.status);
      expect(body).toEqual(mockResponse.data);
    });
  });
});
