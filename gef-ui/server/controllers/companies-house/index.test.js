import { companiesHouse, validateCompaniesHouse } from './index';
import api from '../../services/api';

jest.mock('../../services/api');

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.applicationId = '123';
  req.body = {};
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockApplicationResponse = () => {
  const res = {};
  res.params = {};
  res.params.exporterId = 'abc';
  return res;
};

const MockExporterResponse = () => {
  const res = {};
  res.details = {};
  res.details.companiesHouseRegistrationNumber = '';
  return res;
};

const MockCHResponse = () => {
  const res = {};
  res.status = 200;
  return res;
};

describe('controllers/about-exporter', () => {
  let mockRequest;
  let mockResponse;
  let mockExporterResponse;

  beforeEach(() => {
    mockRequest = MockRequest();
    mockResponse = MockResponse();
    mockExporterResponse = MockExporterResponse();

    api.getApplication.mockResolvedValue(MockApplicationResponse());
    api.getExporter.mockResolvedValue(mockExporterResponse);
    api.getCompaniesHouseDetails.mockResolvedValue(MockCHResponse());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Comapnies House', () => {
    it('renders the `companies-house` template with empty field', async () => {
      mockExporterResponse.details.companiesHouseRegistrationNumber = '';
      api.getExporter.mockResolvedValueOnce(mockExporterResponse);
      await companiesHouse(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', {
        regNumber: '',
        applicationId: '123',
        status: undefined,
      });
    });

    it('renders the `companies-house` template with pre-populated field', async () => {
      mockExporterResponse.details.companiesHouseRegistrationNumber = 'xyz';
      api.getExporter.mockResolvedValueOnce(mockExporterResponse);
      await companiesHouse(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', {
        regNumber: 'xyz',
        applicationId: '123',
        status: undefined,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      const mockedRejection = { response: { status: 400, message: 'Whoops' } };
      api.getApplication.mockRejectedValueOnce(mockedRejection);
      await companiesHouse(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate Companies House', () => {
    it('returns error object if companies house registration number is empty', async () => {
      mockRequest.body.regNumber = '';

      await validateCompaniesHouse(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', expect.objectContaining({
        errors: expect.any(Object),
        regNumber: '',
        applicationId: '123',
        status: undefined,
      }));
    });

    it('returns error object if companies house registration number is invalid', async () => {
      mockRequest.body.regNumber = 'invalidregnumber';
      const mockedRejection = { status: 422, data: [{ errMsg: 'Message', errRef: 'Reference' }] };
      api.getCompaniesHouseDetails.mockResolvedValueOnce(mockedRejection);

      await validateCompaniesHouse(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', expect.objectContaining({
        errors: expect.any(Object),
        regNumber: 'invalidregnumber',
        applicationId: '123',
        status: undefined,
      }));
    });

    it('redirects user to `exporters address` page if response from api is successful', async () => {
      mockRequest.body.regNumber = '123';
      await validateCompaniesHouse(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('exporters-address');
    });

    it('redirects user to `applications details` page if response from api is successful and status query is set to `change`', async () => {
      mockRequest.query.status = 'change';
      mockRequest.body.regNumber = '123';
      await validateCompaniesHouse(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      const mockedRejection = { response: { status: 400, message: 'Whoops' } };
      api.getApplication.mockRejectedValueOnce(mockedRejection);
      await validateCompaniesHouse(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
