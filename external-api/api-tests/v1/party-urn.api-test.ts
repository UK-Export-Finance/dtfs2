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

import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import { app } from '../../server/createApp';
import { api } from '../api';

const { APIM_MDM_URL } = process.env;
const { get } = api(app);

// Mock Axios
const axiosMock = new MockAdapter(axios);
axiosMock.onGet(`${APIM_MDM_URL}v1/customers?partyUrn=03827491`).reply(HttpStatusCode.Ok, {});

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
