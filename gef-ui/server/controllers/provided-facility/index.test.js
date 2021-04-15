import { providedFacility, validateProvidedFacility } from './index';
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

const MockProvidedFacilityResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Provided Facility', () => {
  it('renders the `Provided Facility` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockProvidedFacilityResponse = new MockProvidedFacilityResponse();

    mockRequest.query.status = 'change';
    mockProvidedFacilityResponse.details.details = ['TERMS', 'RESOLVING'];
    mockProvidedFacilityResponse.details.type = 'CASH';
    api.getFacility = () => Promise.resolve(mockProvidedFacilityResponse);
    await providedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/provided-facility.njk', expect.objectContaining({
      details: ['TERMS', 'RESOLVING'],
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
    await providedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Provided Facility', () => {
  it('redirects user to application page if application page if save and return is set to true', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockProvidedFacilityResponse = new MockProvidedFacilityResponse();
    mockRequest.query.saveAndReturn = 'true';

    api.updateFacility = () => Promise.resolve(mockProvidedFacilityResponse);
    await validateProvidedFacility(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to application page if application page if query status is equal to `change`', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockProvidedFacilityResponse = new MockProvidedFacilityResponse();
    mockRequest.query.status = 'change';

    api.updateFacility = () => Promise.resolve(mockProvidedFacilityResponse);
    await validateProvidedFacility(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('shows error message if Other textarea is left empty', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    mockRequest.body.details = 'OTHER';

    await validateProvidedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/provided-facility.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#detailsOther', text: expect.any(String) }]),
      }),
    }));

    mockRequest.body.details = ['OTHER', 'TERMS'];

    await validateProvidedFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/provided-facility.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#detailsOther', text: expect.any(String) }]),
      }),
    }));
  });

  it('calls the updateFacility api with the correct data', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

    mockRequest.body.details = ['TERMS', 'RESOLVING'];
    mockRequest.body.type = 'CASH';

    await validateProvidedFacility(mockRequest, mockResponse);

    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      details: ['TERMS', 'RESOLVING'],
      detailsOther: undefined,
    });
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.updateFacility = () => Promise.reject();
    await validateProvidedFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
