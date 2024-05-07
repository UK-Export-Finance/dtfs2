import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { app } from '../../src/createApp';
import { api } from '../api';

const { APIM_MDM_URL } = process.env;
const { get } = api(app);

// Mock Axios
const axiosMock = new MockAdapter(axios);
axiosMock.onGet(`${APIM_MDM_URL}customers?partyUrn=03827491`).reply(HttpStatusCode.Ok, {});

describe('/party-db/urn', () => {
  describe('GET /party-db/urn', () => {
    it('returns a 200 response with a valid party urn', async () => {
      const { status } = await get('/party-db/urn/03827491');

      expect(status).toEqual(HttpStatusCode.Ok);
    });
  });

  const invalidPartyUrnTestCases = [['123'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when party urn is invalid', () => {
    test.each(invalidPartyUrnTestCases)('returns 400 if you provide an invalid party urn %s', async (partyUrn) => {
      const { status, body } = await get(`/party-db/urn/${partyUrn}`);

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body).toMatchObject({ data: 'Invalid party URN', status: HttpStatusCode.BadRequest });
    });
  });
});
