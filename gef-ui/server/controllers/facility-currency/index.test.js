import { facilityCurrency, updateFacilityCurrency } from './index';
import * as api from '../../services/api';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.body = {};
  req.params.applicationId = '123';
  req.params.facilityId = 'xyz';
  return req;
};

const MockFacilityCurrencyResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Facility Currency', () => {
  it('renders the `Facility Currency` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityCurrencyResponse = new MockFacilityCurrencyResponse();

    mockRequest.query.status = 'change';
    mockFacilityCurrencyResponse.details.currency = 'EUR';
    mockFacilityCurrencyResponse.details.type = 'CASH';
    api.getFacility = () => Promise.resolve(mockFacilityCurrencyResponse);

    await facilityCurrency(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-currency.njk', expect.objectContaining({
      currency: 'EUR',
      facilityTypeString: 'cash',
      applicationId: '123',
      facilityId: 'xyz',
      status: 'change',
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getFacility = () => Promise.reject();
    await facilityCurrency(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Update Facility Currency', () => {
  it('calls the update api with the correct data', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

    mockRequest.body.currency = 'EUR';

    await updateFacilityCurrency(mockRequest, mockResponse);

    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      currency: 'EUR',
    });
  });

  it('redirects user to application page if save and return is set to true', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityCurrencyResponse = new MockFacilityCurrencyResponse();
    mockRequest.query.saveAndReturn = 'true';

    api.updateFacility = () => Promise.resolve(mockFacilityCurrencyResponse);
    await updateFacilityCurrency(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to application page if query status is equal to `change`', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityCurrencyResponse = new MockFacilityCurrencyResponse();
    mockRequest.query.status = 'change';

    api.updateFacility = () => Promise.resolve(mockFacilityCurrencyResponse);
    await updateFacilityCurrency(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to facility value page if everything is successful', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityCurrencyResponse = new MockFacilityCurrencyResponse();

    mockRequest.body.currency = 'EUR';

    api.updateFacility = () => Promise.resolve(mockFacilityCurrencyResponse);
    await updateFacilityCurrency(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/facility-value');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.updateFacility = () => Promise.reject();
    await updateFacilityCurrency(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
