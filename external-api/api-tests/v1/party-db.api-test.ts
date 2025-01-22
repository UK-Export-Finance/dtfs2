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
import { MOCK_COMPANY_REGISTRATION_NUMBERS, isSalesforceCustomerCreationEnabled } from '@ukef/dtfs2-common';
import { app } from '../../src/createApp';
import { api } from '../api';

const { APIM_MDM_URL } = process.env;
const { VALID, VALID_WITH_LETTERS, INVALID_TOO_SHORT, INVALID_TOO_LONG } = MOCK_COMPANY_REGISTRATION_NUMBERS;
const { get, post } = api(app);
const bodyValid = { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: 3 };
let axiosMock: MockAdapter;

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isSalesforceCustomerCreationEnabled: jest.fn(),
}));

beforeEach(() => {
  axiosMock = new MockAdapter(axios);

  axiosMock.onGet(`${APIM_MDM_URL}customers?companyReg=${VALID}`).reply(HttpStatusCode.Ok, {});
  axiosMock.onGet(`${APIM_MDM_URL}customers?companyReg=${VALID_WITH_LETTERS}`).reply(HttpStatusCode.Ok, {});
  axiosMock.onPost(`${APIM_MDM_URL}customers`).reply(HttpStatusCode.Ok);
});

afterEach(() => {
  axiosMock.resetHistory();
});

describe('when automatic Salesforce customer creation feature flag is disabled', () => {
  beforeEach(() => {
    jest.mocked(isSalesforceCustomerCreationEnabled).mockReturnValue(false);
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
});

describe('when automatic Salesforce customer creation feature flag is enabled', () => {
  beforeEach(() => {
    jest.mocked(isSalesforceCustomerCreationEnabled).mockReturnValue(true);
  });

  describe('GET /party-db', () => {
    it(`returns a ${HttpStatusCode.Ok} response with a valid companies house number`, async () => {
      const { status } = await get(`/party-db/${VALID}`);

      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it(`returns a ${HttpStatusCode.Ok} response with a valid companies house number with letters`, async () => {
      const { status } = await get(`/party-db/${VALID_WITH_LETTERS}`);

      expect(status).toEqual(HttpStatusCode.Ok);
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

  describe('POST /party-db', () => {
    it(`returns a ${HttpStatusCode.Ok} response with a valid body`, async () => {
      const { status } = await post(bodyValid).to(`/party-db/`);

      expect(status).toEqual(HttpStatusCode.Ok);
    });

    const invalidBodies = [
      { companyRegNo: null, companyName: 'Some name', probabilityOfDefault: 3 },
      { companyRegNo: VALID, companyName: null, probabilityOfDefault: 3 },
      { companyRegNo: VALID, companyName: 'Some name', probabilityOfDefault: null },
      { companyRegNo: INVALID_TOO_SHORT, companyName: 'Some name', probabilityOfDefault: 3 },
      { companyRegNo: INVALID_TOO_LONG, companyName: 'Some name', probabilityOfDefault: 3 },
    ];

    describe('when the body is invalid', () => {
      test.each(invalidBodies)(`returns a ${HttpStatusCode.BadRequest} if you provide an invalid body %s`, async (invalidBody) => {
        const { status } = await post(invalidBody).to(`/party-db/`);

        expect(status).toEqual(HttpStatusCode.BadRequest);
      });
    });
  });
});
