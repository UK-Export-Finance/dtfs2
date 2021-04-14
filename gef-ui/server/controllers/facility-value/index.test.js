import { facilityValue, updateFacilityValue } from './index';
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

const MockFacilityValueResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Facility Value', () => {
  it('renders the `Facility Value` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityValueResponse = new MockFacilityValueResponse();

    mockRequest.query.status = 'change';
    mockFacilityValueResponse.details.currency = 'EUR';
    mockFacilityValueResponse.details.type = 'CASH';
    mockFacilityValueResponse.details.value = 2000;
    mockFacilityValueResponse.details.coverPercentage = 20;
    mockFacilityValueResponse.details.interestPercentage = 10;
    api.getFacility = () => Promise.resolve(mockFacilityValueResponse);

    await facilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      currency: 'EUR',
      value: '2000',
      facilityType: 'CASH',
      coverPercentage: '20',
      interestPercentage: '10',
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
    await facilityValue(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Update Facility Value', () => {
  // it('redirects user to application page if returnToApplication is set to true', async () => {
  //   const mockResponse = new MockResponse();
  //   const mockRequest = new MockRequest();
  //   const mockFacilityValueResponse = new MockFacilityValueResponse();
  //   mockRequest.query.returnToApplication = 'true';

  //   api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
  //   await updateFacilityValue(mockRequest, mockResponse);

  //   expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  // });

  it('shows error message if cover percentage value is not a number', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityValueResponse = new MockFacilityValueResponse();

    mockRequest.body.coverPercentage = 'NOTNUMBER';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));

    mockRequest.body.coverPercentage = '2.0';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));
  });

  it('calls the update api with the correct data', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

    mockRequest.body.currency = 'EUR';

    await updateFacilityValue(mockRequest, mockResponse);

    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      currency: 'EUR',
    });
  });

  it('redirects user to facility value page with correct query if query status is equal to `change`', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityValueResponse = new MockFacilityValueResponse();
    mockRequest.query.status = 'change';
    mockRequest.body.currency = 'EUR';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/facility-value?status=change');
  });

  it('redirects user to facility value page if everything is successful', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityValueResponse = new MockFacilityValueResponse();

    mockRequest.body.currency = 'EUR';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/facility-value');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    mockRequest.body.currency = 'EUR';

    api.updateFacility = () => Promise.reject();
    await updateFacilityValue(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
