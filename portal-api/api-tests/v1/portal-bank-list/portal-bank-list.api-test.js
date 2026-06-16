const { HttpStatusCode } = require('axios');
const dotenv = require('dotenv');
const app = require('../../../server/createApp');
const { withApiKeyAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { get } = require('../../api')(app);

dotenv.config();

const { PORTAL_API_KEY } = process.env;

jest.mock('../../../server/v1/api', () => ({
  getPortalBankList: jest.fn(),
}));

const api = require('../../../server/v1/api');

const URL = '/v1/portal-bank-list';

const banks = [
  { _id: '60f7f9c2e1b4a12d34c56789', name: 'Bank 1', order: 1 },
  { _id: '60f7f9c2e1b4a12d34c5678a', name: 'Bank 2', order: 2 },
];

describe('/v1/portal-bank-list', () => {
  describe('GET /v1/portal-bank-list', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    withApiKeyAuthenticationTests({
      makeRequestWithHeaders: (headers) => get(URL, { headers }),
    });

    describe('when the api key is valid', () => {
      const validHeaders = { 'x-api-key': PORTAL_API_KEY };

      it(`should return ${HttpStatusCode.Ok} with the list of banks from the central api`, async () => {
        api.getPortalBankList.mockResolvedValueOnce(banks);

        const { status, body } = await get(URL, { headers: validHeaders });

        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body).toEqual(banks);
      });

      it('should return 200 with an empty array when the central api returns no banks', async () => {
        api.getPortalBankList.mockResolvedValueOnce([]);

        const { status, body } = await get(URL, { headers: validHeaders });

        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body).toEqual([]);
      });

      it('should return 500 with an error body when the central api throws an unknown error', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        api.getPortalBankList.mockRejectedValueOnce(new Error('Network down'));

        const { status, body } = await get(URL, { headers: validHeaders });

        expect(status).toEqual(HttpStatusCode.InternalServerError);
        expect(body).toEqual({
          status: HttpStatusCode.InternalServerError,
          message: 'Failed to get portal bank list',
        });
      });
    });
  });
});
