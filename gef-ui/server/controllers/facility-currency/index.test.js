import { facilityCurrency, updateFacilityCurrency } from '.';
import api from '../../services/api';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');

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
  req.params.dealId = '123';
  req.params.facilityId = 'xyz';
  return req;
};

const MockFacilityCurrencyResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('GET Facility Currency', () => {
  it('renders the `Facility Currency` template', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    const mockFacilityCurrencyResponse = MockFacilityCurrencyResponse();

    mockRequest.query.status = 'change';
    mockFacilityCurrencyResponse.details.currency = { id: 'EUR' };
    mockFacilityCurrencyResponse.details.type = CONSTANTS.FACILITY_TYPE.CASH;
    api.getFacility.mockResolvedValueOnce(mockFacilityCurrencyResponse);

    await facilityCurrency(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-currency.njk', expect.objectContaining({
      currencyId: 'EUR',
      facilityTypeString: 'cash',
      dealId: '123',
      facilityId: 'xyz',
      status: 'change',
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();

    api.getFacility = () => Promise.reject();
    await facilityCurrency(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Update Facility Currency', () => {
  it('saves and redirects user to application page if saveAndReturn is set to true and currency has been set', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.currencyId = 'EUR';
    api.updateFacility = jest.fn();

    await updateFacilityCurrency(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalled();
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to application page if saveAndReturn is set to true and currency has not been set', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    mockRequest.query.saveAndReturn = 'true';
    api.updateFacility = jest.fn();

    await updateFacilityCurrency(mockRequest, mockResponse);

    expect(api.updateFacility).not.toHaveBeenCalled();
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('shows error message if no radio buttons have been selected', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    const mockFacilityCurrencyResponse = MockFacilityCurrencyResponse();

    api.updateFacility = () => Promise.resolve(mockFacilityCurrencyResponse);
    await updateFacilityCurrency(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-currency.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#currencyId', text: expect.any(String) }]),
      }),
    }));
  });

  it('calls the update api with the correct data', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

    mockRequest.body.currencyId = 'EUR';

    await updateFacilityCurrency(mockRequest, mockResponse);

    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      currency: { id: 'EUR' },
    });
  });

  it('redirects user to facility value page with correct query if query status is equal to `change`', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    const mockFacilityCurrencyResponse = MockFacilityCurrencyResponse();
    mockRequest.query.status = 'change';
    mockRequest.body.currencyId = 'EUR';

    api.updateFacility = () => Promise.resolve(mockFacilityCurrencyResponse);
    await updateFacilityCurrency(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/facility-value?status=change');
  });

  it('redirects user to facility value page if everything is successful', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    const mockFacilityCurrencyResponse = MockFacilityCurrencyResponse();

    mockRequest.body.currencyId = 'EUR';

    api.updateFacility = () => Promise.resolve(mockFacilityCurrencyResponse);
    await updateFacilityCurrency(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/facility-value');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = MockResponse();
    const mockRequest = MockRequest();
    mockRequest.body.currencyId = 'EUR';

    api.updateFacility = () => Promise.reject();
    await updateFacilityCurrency(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
