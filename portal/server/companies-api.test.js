import axios, { AxiosError, HttpStatusCode } from 'axios';
import { HEADERS, MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common';

const { when } = require('jest-when');
const { getCompanyByRegistrationNumber } = require('./companies-api');

require('dotenv').config();

const { PORTAL_API_URL } = process.env;

const registrationNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.VALID;
const token = 'a token';

const portalApiGetCompanyResponse = {
  companiesHouseRegistrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
  companyName: 'TEST COMPANY LTD',
  registeredAddress: {
    addressLine1: '1 Test Street',
    locality: 'Test City',
    postalCode: 'A1 2BC',
    country: 'United Kingdom',
  },
  industries: [],
};

const apiErrorCases = [
  {
    status: HttpStatusCode.BadRequest,
    errorMessage: 'Enter a valid Companies House registration number',
  },
  {
    status: HttpStatusCode.NotFound,
    errorMessage: 'No company matching the Companies House registration number entered was found',
  },
  {
    status: HttpStatusCode.UnprocessableEntity,
    errorMessage: 'UKEF can only process applications from companies based in the UK',
  },
];

let axiosGetActual;
let axiosGetMock;

describe('getCompanyByRegistrationNumber()', () => {
  beforeAll(() => {
    axiosGetActual = axios.get;
    axiosGetMock = jest.fn();
    axios.get = axiosGetMock;
  });

  afterAll(() => {
    axios.get = axiosGetActual;
  });

  it('returns the company if it is returned by the request to Portal API', async () => {
    mockAxiosGetReturning({ status: HttpStatusCode.Ok, data: portalApiGetCompanyResponse });

    const response = await getCompanyByRegistrationNumber(registrationNumber, token);

    expect(response).toEqual({ company: portalApiGetCompanyResponse });
  });

  it('returns the correct error information if it is called without a registration number', async () => {
    const response = await getCompanyByRegistrationNumber(undefined, token);

    expect(response).toEqual({
      errorMessage: 'Enter a Companies House registration number',
    });
  });

  it('returns the correct error information if it is called with a null registration number', async () => {
    const response = await getCompanyByRegistrationNumber(null, token);

    expect(response).toEqual({
      errorMessage: 'Enter a Companies House registration number',
    });
  });

  it('returns the correct error information if it is called with a registration number that is the empty string', async () => {
    const response = await getCompanyByRegistrationNumber('', token);

    expect(response).toEqual({
      errorMessage: 'Enter a Companies House registration number',
    });
  });

  it('returns the correct error information if it is called with an invalid registration number', async () => {
    const response = await getCompanyByRegistrationNumber(MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT, token);

    expect(response).toEqual({
      errorMessage: 'Enter a valid Companies House registration number',
    });
  });

  it.each(apiErrorCases)('returns the correct error information if the request to Portal API returns a $status', async ({ status, errorMessage }) => {
    const axiosError = new AxiosError();
    axiosError.response = {
      status,
    };
    mockAxiosGetThrowing(axiosError);

    const response = await getCompanyByRegistrationNumber(registrationNumber, token);

    expect(response).toEqual({
      errorMessage,
    });
  });

  it('returns the correct error information if the request to Portal API returns an unhandled status', async () => {
    const axiosError = new AxiosError();
    axiosError.response = {
      status: HttpStatusCode.InternalServerError,
    };
    mockAxiosGetThrowing(axiosError);

    const response = await getCompanyByRegistrationNumber(registrationNumber, token);

    expect(response).toEqual({
      errorMessage: 'An unknown error occurred. Please try again or enter the company details manually',
    });
  });

  it('returns the correct error information if making the request to Portal API throws an unhandled error', async () => {
    const error = new Error();
    mockAxiosGetThrowing(error);

    const response = await getCompanyByRegistrationNumber(registrationNumber, token);

    expect(response).toEqual({
      errorMessage: 'An unknown error occurred. Please try again or enter the company details manually',
    });
  });

  function mockAxiosGetReturning(response) {
    when(axiosGetMock)
      .calledWith(`${PORTAL_API_URL}/v1/companies/${registrationNumber}`, {
        headers: {
          Authorization: token,
          [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        },
      })
      .mockResolvedValueOnce(response);
  }

  function mockAxiosGetThrowing(error) {
    when(axiosGetMock)
      .calledWith(`${PORTAL_API_URL}/v1/companies/${registrationNumber}`, {
        headers: {
          Authorization: token,
          [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        },
      })
      .mockRejectedValueOnce(error);
  }
});
