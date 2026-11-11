import { HttpStatusCode } from 'axios';
import { axiosMock } from '@ukef/dtfs2-common/test-helpers/axios-mock-adapter';
import { app } from '@ukef/external-api/server/createApp';
import { api } from '@ukef/external-api/api-tests/api';

const { APIM_MDM_URL } = process.env;
const { get } = api(app);

axiosMock.onGet(`${APIM_MDM_URL}v1/customers?partyUrn=03827491`).reply(HttpStatusCode.Ok, {});

describe('/party-db/urn', () => {
  describe('GET /party-db/urn', () => {
    it('should return a 200 response with a valid party urn', async () => {
      const { status } = await get('/party-db/urn/03827491');

      expect(status).toEqual(HttpStatusCode.Ok);
    });
  });

  const invalidPartyUrnTestCases = [['123'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when party urn is invalid', () => {
    test.each(invalidPartyUrnTestCases)('should return a 400 if you provide an invalid party urn %s', async (partyUrn) => {
      const { status, body } = await get(`/party-db/urn/${partyUrn}`);

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body).toMatchObject({ data: 'Invalid party URN', status: HttpStatusCode.BadRequest });
    });
  });
});
