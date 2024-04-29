import { app } from '../../src/createApp';
import { api } from '../api';
import MockAdapter from 'axios-mock-adapter';
import { COMPANIES_HOUSE_NUMBER } from '../test-mocks/companies-house-number';
import axios, { HttpStatusCode } from 'axios';

const { APIM_MDM_URL } = process.env;
const { VALID_1, VALID_2, VALID_WITH_LETTERS } = COMPANIES_HOUSE_NUMBER;
const { get } = api(app);

// Mock Axios
const axiosMock = new MockAdapter(axios);
axiosMock.onGet(`${APIM_MDM_URL}customers?companyReg=${VALID_1}`).reply(HttpStatusCode.Ok, {});
axiosMock.onGet(`${APIM_MDM_URL}customers?companyReg=${VALID_2}`).reply(HttpStatusCode.Ok, {});
axiosMock.onGet(`${APIM_MDM_URL}customers?companyReg=${VALID_WITH_LETTERS}`).reply(HttpStatusCode.Ok, {});

describe('/party-db', () => {
  describe('GET /party-db', () => {
    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get(`/party-db/${VALID_1}`);

      expect(status).toEqual(200);
    });

    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get(`/party-db/${VALID_WITH_LETTERS}`);

      expect(status).toEqual(200);
    });

    it('returns a 200 response with a valid companies house number', async () => {
      const { status } = await get(`/party-db/${VALID_2}`);

      expect(status).toEqual(200);
    });
  });

  const invalidCompaniesHouseNumberTestCases = [['ABC22'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when company house number is invalid', () => {
    test.each(invalidCompaniesHouseNumberTestCases)('returns a 400 if you provide an invalid company house number %s', async (companyHouseNumber) => {
      const { status, body } = await get(`/party-db/${companyHouseNumber}`);

      expect(status).toEqual(400);
      expect(body).toMatchObject({ data: 'Invalid company registration number', status: 400 });
    });
  });
});
