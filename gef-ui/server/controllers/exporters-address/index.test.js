import { exportersAddress, validateExportersAddress } from './index';
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

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Exporters Address', () => {
  it('renders the `exporters-address` template', async () => {
    const mockRequest = new MockRequest();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockResponse = new MockResponse();

    mockExporterResponse.details.companyName = 'Test company';
    mockExporterResponse.details.registeredAddress = { line1: 'Line 1', line2: 'Line 2' };
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await exportersAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
      applicationId: '123',
      companyName: 'Test company',
      registeredAddress: expect.any(Object),
    });
  });

  it('renders the `exporters-address` template without registered address', async () => {
    const mockRequest = new MockRequest();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockResponse = new MockResponse();

    mockExporterResponse.details.companyName = 'Test company';
    mockExporterResponse.details.registeredAddress = null;
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await exportersAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', {
      applicationId: '123',
      companyName: 'Test company',
      registeredAddress: null,
    });
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };

    api.getApplication = () => Promise.reject(mockedRejection);
    await exportersAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Exporters Address', () => {
  it('returns error object if radio button hasnt been selected', async () => {
    const mockRequest = new MockRequest();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockResponse = new MockResponse();

    mockRequest.body.correspondence = '';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);

    await validateExportersAddress(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', expect.objectContaining({
      applicationId: '123',
      companyName: undefined,
      errors: expect.any(Object),
      correspondence: '',
      registeredAddress: undefined,
    }));
  });

  it('redirects user to `about exporter` page if user selects `false` from the radio buttons', async () => {
    const mockRequest = new MockRequest();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockResponse = new MockResponse();

    mockRequest.body.correspondence = 'false';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await validateExportersAddress(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('about-exporter');
  });

  it('returns postcode error if postcode hasnt been entered', async () => {
    const mockRequest = new MockRequest();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockResponse = new MockResponse();

    mockRequest.body.correspondence = 'true';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await validateExportersAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/exporters-address.njk', expect.objectContaining({
      applicationId: '123',
      companyName: undefined,
      errors: expect.any(Object),
      correspondence: 'true',
      registeredAddress: undefined,
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
    const mockResponse = new MockResponse();
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };

    api.getApplication = () => Promise.reject(mockedRejection);
    await validateExportersAddress({}, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
