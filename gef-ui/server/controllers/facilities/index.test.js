import { facilities, createFacility } from './index';
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
  return req;
};

const MockFacilityResponse = () => {
  const res = {};
  res.details = {
    _id: 'abc',
    facilityType: 'CASH',
    applicationId: '123',
    hasBeenIssued: true,
  };
  return res;
};

const createFacilitySpy = jest.spyOn(api, 'createFacility').mockImplementationOnce(() => Promise.resolve());
const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

afterEach(() => {
  jest.clearAllMocks();
});

describe('Facilities', () => {
  it('renders the `Facilities` template when there is no facility ID provided', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    await facilities(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/facilities.njk', expect.objectContaining({
      facilityType: 'cash',
      applicationId: '123',
      status: undefined,
    }));
  });

  it('renders the `Facilities` template when there is a facility ID', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityResponse = new MockFacilityResponse();

    mockRequest.params.facilityId = 'xyz';
    api.getFacility = () => Promise.resolve(mockFacilityResponse);
    await facilities(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/facilities.njk', expect.objectContaining({
      facilityType: 'cash',
      applicationId: '123',
      hasBeenIssued: 'true',
      status: undefined,
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    mockRequest.params.facilityId = 'xyz';

    api.getFacility = () => Promise.reject();
    await facilities(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Create Facility', () => {
  it('returns Has Been Issued validation error', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();


    await createFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facilities.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#hasBeenIssued', text: expect.any(String) }]),
      }),
      applicationId: '123',
    }));
  });

  it('calls the create facility api if no facility ID has been provided', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    mockRequest.body.hasBeenIssued = 'true';
    await createFacility(mockRequest, mockResponse);

    expect(updateFacilitySpy).not.toHaveBeenCalled();
    expect(createFacilitySpy).toHaveBeenCalledWith({
      applicationId: '123',
      hasBeenIssued: true,
      type: 'CASH',
    });
  });

  it('calls the update facility api if facility ID has been provided', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    mockRequest.body.hasBeenIssued = 'false';
    mockRequest.params.facilityId = 'xyz';
    await createFacility(mockRequest, mockResponse);

    expect(createFacilitySpy).not.toHaveBeenCalled();
    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      hasBeenIssued: false,
    });
  });

  it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };
    mockRequest.body.hasBeenIssued = 'true';
    api.createFacility = () => Promise.reject(mockedRejection);
    await createFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });

  it('redirects user to `application` page if status query is set to `Change`', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    mockRequest.query.status = 'change';
    mockRequest.body.hasBeenIssued = 'true';


    api.createFacility = () => Promise.resolve();
    await createFacility(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to `about facility` page if response from api is successful', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityResponse = new MockFacilityResponse();

    mockRequest.body.hasBeenIssued = 'true';

    api.createFacility = () => Promise.resolve(mockFacilityResponse);
    await createFacility(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/abc/about-facility');
  });
});
