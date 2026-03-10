import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common/test-helpers';
import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { app } from '../../server/createApp';
import { api } from '../api';

dotenv.config();

const { APIM_MDM_URL } = process.env;

const getMdmUrlForRegistrationNumber = (registrationNumber: string) => `${APIM_MDM_URL}v1/companies?registrationNumber=${registrationNumber}`;

const { get } = api(app);

const axiosMock = new MockAdapter(axios);

const mdmGetCompanyResponse = {
  companiesHouseRegistrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
  companyName: 'TEST COMPANY LTD',
  registeredAddress: {
    addressLine1: '1 Test Street',
    locality: 'Test City',
    postalCode: 'A1 2BC',
    country: 'United Kingdom',
  },
  industries: [
    {
      class: {
        code: '59112',
        name: 'Video production activities',
      },
      code: '1009',
      name: 'Information and communication',
    },
    {
      class: {
        code: '62012',
        name: 'Business and domestic software development',
      },
      code: '1009',
      name: 'Information and communication',
    },
    {
      class: {
        code: '62020',
        name: 'Information technology consultancy activities',
      },
      code: '1009',
      name: 'Information and communication',
    },
    {
      class: {
        code: '62090',
        name: 'Other information technology service activities',
      },
      code: '1009',
      name: 'Information and communication',
    },
  ],
};

const mdmGetCompanyNotFoundResponse = {
  message: 'Not found',
  statusCode: HttpStatusCode.NotFound,
};

const mdmGetCompanyUnprocessableEntityResponse = {
  message: 'Unprocessable entity',
  statusCode: HttpStatusCode.UnprocessableEntity,
};

const mdmGetCompanyTooManyRequestsResponse = {
  message: 'Too many requests',
  statusCode: HttpStatusCode.TooManyRequests,
};

const mdmGetCompanyInternalServerErrorResponse = {
  message: 'Internal server error',
  statusCode: HttpStatusCode.InternalServerError,
};

const testCases = [
  {
    registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
    expectedStatus: HttpStatusCode.Ok,
    expectedBody: mdmGetCompanyResponse,
  },
  {
    registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID_NONEXISTENT,
    expectedStatus: HttpStatusCode.NotFound,
    expectedBody: mdmGetCompanyNotFoundResponse,
  },
  {
    registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID_OVERSEAS,
    expectedStatus: HttpStatusCode.UnprocessableEntity,
    expectedBody: mdmGetCompanyUnprocessableEntityResponse,
  },
  {
    registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
    expectedStatus: HttpStatusCode.TooManyRequests,
    expectedBody: mdmGetCompanyTooManyRequestsResponse,
  },
  {
    registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
    expectedStatus: HttpStatusCode.InternalServerError,
    expectedBody: mdmGetCompanyInternalServerErrorResponse,
  },
];

describe('GET /companies/:registrationNumber', () => {
  it.each(testCases)(
    'returns the $expectedStatus with the response body from APIM MDM, if MDM returns a $expectedStatus code with a response body',
    async ({ registrationNumber, expectedStatus, expectedBody }) => {
      axiosMock.onGet(getMdmUrlForRegistrationNumber(registrationNumber)).reply(expectedStatus, expectedBody);

      const response = await get(`/companies/${registrationNumber}`);

      expect(response.status).toEqual(expectedStatus);
      expect(response.body).toStrictEqual(expectedBody);
    },
  );

  it(`returns a ${HttpStatusCode.BadRequest} if the company registration number is invalid`, async () => {
    const response = await get(`/companies/${MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT}`);

    expect(response.status).toEqual(HttpStatusCode.BadRequest);
    expect(response.body).toStrictEqual({
      error: 'Bad Request',
      statusCode: HttpStatusCode.BadRequest,
    });
  });
});
