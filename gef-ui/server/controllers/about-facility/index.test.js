import aboutFacility from './index';
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
  req.params.facilityId = 'xyz';
  return req;
};

const MockAboutFacilityResponse = () => {
  const res = {};
  res.details = {
    type: 'CASH',
  };
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Facility', () => {
  it('renders the `Facility` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutFacilityResponse = new MockAboutFacilityResponse();

    api.getFacility = () => Promise.resolve(mockAboutFacilityResponse);
    await aboutFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
      facilityType: 'CASH',
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getFacility = () => Promise.reject();
    await aboutFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
