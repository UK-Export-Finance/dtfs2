import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { HttpStatusCode } from 'axios';
import api from '../../services/api';
import { companiesHouse, validateCompaniesHouse } from './index';

import { validationErrorHandler } from '../../utils/helpers';

jest.mock('../../services/api');
jest.mock('../../utils/helpers');

const userToken = 'user-token';
const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.dealId = '123';
  req.body = {};
  req.session = {
    user: {
      _id: '12345',
    },
    userToken,
  };
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockApplicationResponse = () => {
  const res = {
    exporter: { someExporterField: 'someExporterValue' },
  };
  res.params = {};
  res.params.exporter = {};
  return res;
};

describe('controllers/about-exporter', () => {
  let mockRequest;
  let mockResponse;
  let mockApplicationResponse;
  let consoleErrorActual;

  const getApplicationSpy = jest.fn();
  const getCompanyByRegistrationNumberMock = jest.fn();
  const updateApplicationSpy = jest.fn();
  const consoleErrorSpy = jest.fn();

  beforeEach(() => {
    mockRequest = MockRequest();
    mockResponse = MockResponse();
    mockApplicationResponse = MockApplicationResponse();

    api.getApplication = getApplicationSpy;
    api.getCompanyByRegistrationNumber = getCompanyByRegistrationNumberMock;
    api.updateApplication = updateApplicationSpy;

    getApplicationSpy.mockResolvedValue(mockApplicationResponse);

    consoleErrorActual = console.error;
    console.error = consoleErrorSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
    console.error = consoleErrorActual;
  });

  describe('GET Companies House', () => {
    it('renders the `companies-house` template with empty field', async () => {
      mockApplicationResponse.exporter.companiesHouseRegistrationNumber = '';
      await companiesHouse(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', {
        regNumber: '',
        dealId: '123',
        status: undefined,
      });
    });

    it('renders the `companies-house` template with pre-populated field', async () => {
      mockApplicationResponse.exporter.companiesHouseRegistrationNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_WITH_SPECIAL_CHARACTER;
      await companiesHouse(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', {
        regNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_WITH_SPECIAL_CHARACTER,
        dealId: '123',
        status: undefined,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      const mockedRejection = { response: { status: HttpStatusCode.BadRequest, message: 'Whoops' } };
      api.getApplication.mockRejectedValueOnce(mockedRejection);
      await companiesHouse(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate Companies House', () => {
    it(`redirects to the 'exporter's address' page when the api.getCompanyByRegistrationNumber call returns company data`, async () => {
      when(getCompanyByRegistrationNumberMock)
        .calledWith({ registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID, userToken })
        .mockResolvedValue({ company: {} });

      mockRequest.body.regNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.VALID;

      await validateCompaniesHouse(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('exporters-address');
    });

    it(`calls api.getApplication with the correct arguments when the api.getCompanyByRegistrationNumber call returns company data`, async () => {
      when(getCompanyByRegistrationNumberMock)
        .calledWith({ registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID, userToken })
        .mockResolvedValue({ company: {} });

      mockRequest.body.regNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.VALID;

      await validateCompaniesHouse(mockRequest, mockResponse);

      expect(getApplicationSpy).toHaveBeenCalledWith({ dealId: '123', userToken });
    });

    it('updates the application with the correct details when the company data contains a non-empty industries array', async () => {
      when(getCompanyByRegistrationNumberMock)
        .calledWith({ registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID, userToken })
        .mockResolvedValue({ company: { industries: ['some industry'] } });

      mockRequest.body.regNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.VALID;

      await validateCompaniesHouse(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
        exporter: {
          someExporterField: 'someExporterValue',
          correspondenceAddress: null,
          isFinanceIncreasing: null,
          probabilityOfDefault: '',
          smeType: '',
          industries: ['some industry'],
          selectedIndustry: 'some industry',
        },
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('updates the application with the correct details when the company data does not contain an industries array', async () => {
      when(getCompanyByRegistrationNumberMock)
        .calledWith({ registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID, userToken })
        .mockResolvedValue({ company: {} });

      mockRequest.body.regNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.VALID;

      await validateCompaniesHouse(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
        exporter: {
          someExporterField: 'someExporterValue',
          correspondenceAddress: null,
          isFinanceIncreasing: null,
          probabilityOfDefault: '',
          smeType: '',
          selectedIndustry: null,
        },
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it(`redirects to the 'application details' page when the api.getCompanyByRegistrationNumber call returns company data and the status query is set to 'change'`, async () => {
      when(getCompanyByRegistrationNumberMock)
        .calledWith({ registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID, userToken })
        .mockResolvedValue({ company: {} });

      mockRequest.query.status = 'change';
      mockRequest.body.regNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.VALID;

      await validateCompaniesHouse(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('rerenders the page with the correct errors when the api.getCompanyByRegistrationNumber call returns an error object', async () => {
      const invalidCompanyRegistrationNumberErrorObject = {
        errRef: 'regNumber',
        errMsg: 'Enter a valid Companies House registration number.',
      };
      const mappedErrorObject = {
        someErrors: 'some errors',
      };

      when(getCompanyByRegistrationNumberMock)
        .calledWith({ registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT, userToken })
        .mockResolvedValue(invalidCompanyRegistrationNumberErrorObject);
      when(validationErrorHandler).calledWith([invalidCompanyRegistrationNumberErrorObject]).mockReturnValue(mappedErrorObject);

      mockRequest.body.regNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT;

      await validateCompaniesHouse(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', {
        errors: mappedErrorObject,
        regNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT,
        dealId: '123',
        status: undefined,
      });
      expect(getApplicationSpy).not.toHaveBeenCalled();
      expect(updateApplicationSpy).not.toHaveBeenCalled();
    });

    it(`redirects to the 'problem with service' page if any of the API calls throw errors`, async () => {
      const mockedRejection = { response: { status: HttpStatusCode.BadRequest, message: 'Whoops' } };
      api.getCompanyByRegistrationNumber.mockRejectedValueOnce(mockedRejection);

      await validateCompaniesHouse(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });

    it.each([{ status: HttpStatusCode.BadRequest }, { status: HttpStatusCode.InternalServerError }])(
      `logs the error if any of the API calls throw a $status error`,
      async ({ status }) => {
        const mockedRejection = { response: { status, message: 'Whoops' } };
        api.getCompanyByRegistrationNumber.mockRejectedValueOnce(mockedRejection);

        await validateCompaniesHouse(mockRequest, mockResponse);

        expect(consoleErrorSpy).toHaveBeenCalledWith('GEF-UI - Error validating companies house page %o', mockedRejection);
      },
    );
  });
});
