import MockAdapter from 'axios-mock-adapter';
import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common';
import { app } from '../../src/createApp';
import { api } from '../api';

dotenv.config();

const { APIM_MDM_URL } = process.env;

const getMdmUrlForRegistrationNumber = (registrationNumber: string) => `${APIM_MDM_URL}companies?registrationNumber=${registrationNumber}`;

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

const mdmGetCompanyBadRequestResponse = {
  message: [
    'registrationNumber must match /^(([A-Z]{2}|[A-Z]\\d|\\d{2})(\\d{5,6}|\\d{4,5}[A-Z]))$/ regular expression',
    'registrationNumber must be longer than or equal to 7 characters',
  ],
  error: 'Bad Request',
  statusCode: 400,
};

const mdmGetCompanyNotFoundResponse = {
  message: 'Not found',
  statusCode: 404,
};

const mdmGetCompanyUnprocessableEntityResponse = {
  message: 'Unprocessable entity',
  statusCode: 422,
};

const mdmGetCompanyInternalServerErrorResponse = {
  message: 'Internal server error',
  statusCode: 500,
};

describe('GET /companies/:registrationNumber', () => {
  it.each([
    {
      registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
      expectedStatus: HttpStatusCode.Ok,
      expectedBody: mdmGetCompanyResponse,
    },
    {
      registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT,
      expectedStatus: HttpStatusCode.BadRequest,
      expectedBody: mdmGetCompanyBadRequestResponse,
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
      expectedStatus: HttpStatusCode.InternalServerError,
      expectedBody: mdmGetCompanyInternalServerErrorResponse,
    },
  ])(
    'returns a $expectedStatus with the response body from MDM if MDM returns a $expectedStatus with a response body',
    async ({ registrationNumber, expectedStatus, expectedBody }) => {
      axiosMock.onGet(getMdmUrlForRegistrationNumber(registrationNumber)).reply(expectedStatus, expectedBody);

      const response = await get(`/companies/${registrationNumber}`);

      expect(response.status).toEqual(expectedStatus);
      expect(response.body).toStrictEqual(expectedBody);
    },
  );
});
