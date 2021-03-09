import { companiesHouse, validateCompaniesHouse } from './index';
import * as api from '../../services/api';

const MockRequest = () => {
  const req = {};
  req.params = {};
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

const mockRequest = new MockRequest();
const mockResponse = new MockResponse();
const mockApplicationResponse = new MockApplicationResponse();
const mockExporterResponse = new MockExporterResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Comapnies House', () => {
  it('renders the `companies-house` template with empty field', async () => {
    mockExporterResponse.details.companiesHouseRegistrationNumber = '';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await companiesHouse(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', {
      regNumber: '',
    });
  });
  it('renders the `companies-house` template with pre-populated field', async () => {
    mockExporterResponse.details.companiesHouseRegistrationNumber = 'xyz';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await companiesHouse(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', {
      regNumber: 'xyz',
    });
  });

  it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getApplication = () => Promise.reject(mockedRejection);
    await companiesHouse({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Companies House', () => {
  it('returns error object if companies house registration number is empty', async () => {
    mockRequest.body.regNumber = '';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await validateCompaniesHouse(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/companies-house.njk', expect.objectContaining({
      errors: expect.any(Object),
      regNumber: '',
    }));
  });

  // it('redirects user to `name application` page if they select `true`', async () => {
  //   const mockedRequest = {
  //     body: {
  //       mandatoryCriteria: 'true',
  //     },
  //   };
  //   api.getMandatoryCriteria = () => Promise.resolve(mockCriteriaResponse);
  //   await validateMandatoryCriteria(mockedRequest, mockResponse);
  //   expect(mockResponse.redirect).toHaveBeenCalledWith('name-application');
  // });

  // it('redirects user to `ineligible` page if they select `false`', async () => {
  //   const mockedRequest = {
  //     body: {
  //       mandatoryCriteria: 'false',
  //     },
  //   };
  //   await validateMandatoryCriteria(mockedRequest, mockResponse);
  //   expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/ineligible');
  // });

  // it('redirects user to `problem with service` page if there is an issue with the api', async () => {
  //   const mockedRequest = {
  //     body: {
  //       mandatoryCriteria: '',
  //     },
  //   };
  //   const mockedRejection = { response: { status: 400, message: 'Whoops' } };
  //   api.getMandatoryCriteria = () => Promise.reject(mockedRejection);
  //   await validateMandatoryCriteria(mockedRequest, mockResponse);
  //   expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  // });
});
