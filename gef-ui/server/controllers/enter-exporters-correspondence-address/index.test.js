import { enterExportersCorrespondenceAddress, validateEnterExportersCorrespondenceAddress } from './index';
import * as api from '../../services/api';
import { DEFAULT_COUNTRY } from '../../../constants';

const MockRequest = () => {
  const req = {};
  req.query = {};
  req.params = {};
  req.params.applicationId = '123';
  req.session = {};
  req.body = {};
  req.get = () => '/url';
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
  res.details.correspondenceAddress = '';
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Enter Exporters Correspondence Address', () => {
  it('renders the `enter-exporters-correspondence-address` template with empty field', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await enterExportersCorrespondenceAddress(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', {
      addressForm: '',
      applicationId: '123',
      backUrl: '/url',
    });
  });

  it('renders the `enter-exporters-correspondence-address` template with data from address session', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();
    mockRequest.session.address = JSON.stringify({ addressLine1: 'line1', addressLine2: 'line2' });
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await enterExportersCorrespondenceAddress(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', {
      addressForm: {
        addressLine1: 'line1',
        addressLine2: 'line2',
        addressLine3: undefined,
        locality: undefined,
        organisationName: undefined,
        postalCode: undefined,
      },
      applicationId: '123',
      backUrl: '/url',
    });
  });

  it('renders the `enter-exporters-correspondence-address` template with data from exporter api', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockExporterResponse = new MockExporterResponse();

    mockExporterResponse.details.correspondenceAddress = { addressLine1: 'LINE1', addressLine2: 'LINE2' };
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.getExporter = () => Promise.resolve(mockExporterResponse);
    await enterExportersCorrespondenceAddress(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', {
      addressForm: {
        addressLine1: 'LINE1',
        addressLine2: 'LINE2',
      },
      applicationId: '123',
      backUrl: '/url',
    });
  });

  it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    api.getApplication = () => Promise.reject(mockedRejection);
    await enterExportersCorrespondenceAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Enter Exporters Correspondence Address', () => {
  it('returns error object if address line 1 field is empty', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    mockRequest.body.addressLine1 = '';
    mockRequest.body.postalCode = '';

    await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', expect.objectContaining({
      errors: expect.any(Object),
      applicationId: '123',
      addressForm: { addressLine1: '', postalCode: '' },
    }));
  });

  it('returns error object if postcode field is empty', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    mockRequest.body.addressLine1 = 'Line1';
    mockRequest.body.postalCode = '';

    await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/enter-exporters-correspondence-address.njk', expect.objectContaining({
      errors: expect.any(Object),
      applicationId: '123',
      addressForm: { addressLine1: 'Line1', postalCode: '' },
    }));
  });

  it(`calls api with country defaulted to ${DEFAULT_COUNTRY}`, async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();

    mockRequest.body.addressLine1 = 'Line1';
    mockRequest.body.postalCode = 'sa1 7fr';

    api.getApplication = () => Promise.resolve(mockApplicationResponse);

    const apiUpdateExporterSpy = jest.fn(() => Promise.resolve(mockExporterResponse));

    api.updateExporter = apiUpdateExporterSpy;
    await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);

    const expectedBody = {
      correspondenceAddress: {
        ...mockRequest.body,
        country: DEFAULT_COUNTRY,
      },
    };

    expect(apiUpdateExporterSpy).toHaveBeenCalledWith(
      mockApplicationResponse.exporterId,
      expectedBody,
    );
  });

  it('redirects user to `about exporter` page if response from api is successful', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();

    mockRequest.body.addressLine1 = 'Line1';
    mockRequest.body.postalCode = 'sa1 7fr';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.updateExporter = () => Promise.resolve(mockExporterResponse);
    await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);
    expect(mockRequest.session.address).toEqual(null);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/about-exporter');
  });

  it('redirects user to `application details` page if response from api is successful and saveToReturn query is set to true', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();

    mockRequest.body.addressLine1 = 'Line1';
    mockRequest.body.postalCode = 'sa1 7fr';
    mockRequest.query.saveAndReturn = 'true';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.updateExporter = () => Promise.resolve(mockExporterResponse);
    await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to `application details` page if response from api is successful and status query is set to `change`', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockExporterResponse = new MockExporterResponse();
    const mockApplicationResponse = new MockApplicationResponse();

    mockRequest.body.addressLine1 = 'Line1';
    mockRequest.body.postalCode = 'sa1 7fr';
    mockRequest.query.status = 'change';
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    api.updateExporter = () => Promise.resolve(mockExporterResponse);
    await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    mockRequest.body.addressLine1 = 'Line1';
    mockRequest.body.postalCode = 'sa1 7fr';
    api.getApplication = () => Promise.reject(mockedRejection);
    await validateEnterExportersCorrespondenceAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
