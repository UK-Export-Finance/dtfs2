import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common/test-helpers';

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
const { VALID, VALID_WITH_LETTERS } = MOCK_COMPANY_REGISTRATION_NUMBERS;
const { get } = api(app);
let axiosMock: MockAdapter;

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
}));

beforeEach(() => {
  axiosMock = new MockAdapter(axios);

  axiosMock.onGet(`${APIM_MDM_URL}v1/customers?companyReg=${VALID}`).reply(HttpStatusCode.Ok, {});
  axiosMock.onGet(`${APIM_MDM_URL}v1/customers?companyReg=${VALID_WITH_LETTERS}`).reply(HttpStatusCode.Ok, {});
  axiosMock.onPost(`${APIM_MDM_URL}v1/customers`).reply(HttpStatusCode.Ok);
});

afterEach(() => {
  axiosMock.resetHistory();
});

describe('/party-db', () => {
  describe('GET /party-db', () => {
    it(`returns a ${HttpStatusCode.Ok} response with a valid companies house number`, async () => {
      const { status } = await get(`/party-db/${VALID}`);

      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it(`returns a ${HttpStatusCode.Ok} response with a valid companies house number with letters`, async () => {
      const { status } = await get(`/party-db/${VALID_WITH_LETTERS}`);

      expect(status).toEqual(HttpStatusCode.Ok);
    });
  });

  const invalidCompaniesHouseNumberTestCases = [['ABC22'], ['127.0.0.1'], ['{}'], ['[]']];

  describe('when company house number is invalid', () => {
    test.each(invalidCompaniesHouseNumberTestCases)(
      `returns a ${HttpStatusCode.BadRequest} if you provide an invalid company house number %s`,
      async (companyHouseNumber) => {
        const { status, body } = await get(`/party-db/${companyHouseNumber}`);

        expect(status).toEqual(HttpStatusCode.BadRequest);
        expect(body).toMatchObject({ data: 'Invalid company registration number', status: HttpStatusCode.BadRequest });
      },
    );
  });
});
