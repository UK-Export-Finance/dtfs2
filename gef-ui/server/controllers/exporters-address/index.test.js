import { exportersAddress } from './index';
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
  return res;
};

const mockRequest = new MockRequest();
const mockResponse = new MockResponse();
const mockApplicationResponse = new MockApplicationResponse();
const mockExporterResponse = new MockExporterResponse();

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Exporters Address', () => {
  it('renders the `exporters-address` template', async () => {
    mockExporterResponse.details.companyName = 'Test company';
    mockExporterResponse.details.registeredAddress = { line1: 'Line 1', line2: 'Line 2' };
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await exportersAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
      applicationId: '123',
      companyName: 'Test company',
      registeredAddress: '<p class="govuk-body">Line 1</p><p class="govuk-body">Line 2</p>',
    });
  });

  it('renders the `exporters-address` template without registed address', async () => {
    mockExporterResponse.details.companyName = 'Test company';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await exportersAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
      applicationId: '123',
      companyName: 'Test company',
      registeredAddress: '',
    });
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    api.getApplication = () => Promise.reject(mockedRejection);
    await exportersAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
