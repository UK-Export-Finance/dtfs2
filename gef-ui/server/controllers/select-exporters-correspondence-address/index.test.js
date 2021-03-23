import { selectExportersCorrespondenceAddress, validateSelectExportersCorrespondenceAddress } from './index';
import * as api from '../../services/api';

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.params.applicationId = '123';
  req.session = {};
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
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Select Exporters Correspondence Address', () => {
  it('renders the `select-exporters-correspondence-address` template', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockApplicationResponse = new MockApplicationResponse();

    mockRequest.session.postcode = 'W1 7PD';
    mockRequest.session.addresses = JSON.stringify([{ addressLine1: 'line1' }]);
    api.getApplication = () => Promise.resolve(mockApplicationResponse);
    await selectExportersCorrespondenceAddress(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/select-exporters-correspondence-address.njk', {
      postcode: 'W1 7PD',
      applicationId: '123',
      addressesForSelection: [
        {
          text: '1 Address Found',
        },
        {
          text: 'line1',
          value: 0,
        },
      ],
    });
  });

  it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    api.getApplication = () => Promise.reject(mockedRejection);
    await selectExportersCorrespondenceAddress(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Select Exporters Correspondence Address', () => {
  it('returns error object if address from select dropdown has not been selected', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    mockRequest.session.postcode = 'W1 7PD';
    mockRequest.session.addresses = JSON.stringify([{ addressLine1: 'line1' }]);
    mockRequest.body.selectedAddress = '';

    await validateSelectExportersCorrespondenceAddress(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/select-exporters-correspondence-address.njk', expect.objectContaining({
      errors: expect.any(Object),
      applicationId: '123',
    }));
  });

  it('sets address object into session string', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    mockRequest.session.postcode = 'W1 7PD';
    mockRequest.session.addresses = JSON.stringify([{ addressLine1: 'line1' }]);
    mockRequest.body.selectedAddress = '0';

    await validateSelectExportersCorrespondenceAddress(mockRequest, mockResponse);

    expect(mockRequest.session.address).toEqual(JSON.stringify({ addressLine1: 'line1' }));
  });

  it('redirects user to `enter-exporters-correspondence-address` page if  successful', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();

    mockRequest.session.postcode = 'W1 7PD';
    mockRequest.session.addresses = JSON.stringify([{ addressLine1: 'line1' }]);
    mockRequest.body.selectedAddress = '0';
    await validateSelectExportersCorrespondenceAddress(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/enter-exporters-correspondence-address');
  });
});
