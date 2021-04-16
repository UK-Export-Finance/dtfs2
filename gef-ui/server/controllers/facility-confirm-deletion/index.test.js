import { facilityConfirmDeletion, deleteFacility } from './index';
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

const MockFacilityResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Facility Confirm Deletion', () => {
  it('renders the `Facility Currency` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityResponse = new MockFacilityResponse();

    mockFacilityResponse.details.type = 'CASH';
    api.getFacility = () => Promise.resolve(mockFacilityResponse);

    await facilityConfirmDeletion(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-confirm-deletion.njk', expect.objectContaining({
      heading: 'Cash',
      applicationId: '123',
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getFacility = () => Promise.reject();
    await facilityConfirmDeletion(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Delete Facility', () => {
  it('calls the update api with the correct data', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const deleteFacilitySpy = jest.spyOn(api, 'deleteFacility').mockImplementationOnce(() => Promise.resolve());

    await deleteFacility(mockRequest, mockResponse);

    expect(deleteFacilitySpy).toHaveBeenCalledWith('xyz');
  });
  it('redirects user to application page if deletion was successful', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();


    api.deleteFacility = () => Promise.resolve();
    await deleteFacility(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.deleteFacility = () => Promise.reject();
    await deleteFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
