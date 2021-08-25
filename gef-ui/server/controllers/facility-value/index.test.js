import { facilityValue, updateFacilityValue } from './index';
import * as api from '../../services/api';

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = (saveAndReturn = false) => {
  const req = {};
  req.params = {};
  req.query = { saveAndReturn };
  req.body = {};
  req.session = {
    user: {
      bank: { id: 'BANK_ID' },
      roles: ['MAKER'],
    },
    userToken: 'secret-token',
  };
  req.params.applicationId = '123';
  req.params.facilityId = 'xyz';
  return req;
};

const MockFacilityValueResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporterId = '123';
  res.coverTermsId = '123';
  res.bankId = 'BANK_ID';
  res.bankInternalRefName = 'My test';
  res.status = 'DRAFT';
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
    const mockApplicationResponse = new MockApplicationResponse();

    mockRequest.query.status = 'change';
    mockFacilityValueResponse.details.currency = 'EUR';
    mockFacilityValueResponse.details.type = 'CASH';
    mockFacilityValueResponse.details.value = 2000;
    mockFacilityValueResponse.details.coverPercentage = 20;
    mockFacilityValueResponse.details.interestPercentage = 10;
    api.getFacility = () => Promise.resolve(mockFacilityValueResponse);
    api.getApplication = () => Promise.resolve(mockApplicationResponse);

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

const FACILITY_GUARANTEE_URL = '/gef/application-details/123/facilities/xyz/facility-guarantee';
const APPLICATION_URL = '/gef/application-details/123';
describe('Update Facility Value', () => {
  it('shows error message if cover percentage value is not a number', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityValueResponse = new MockFacilityValueResponse();

    mockRequest.body.coverPercentage = 'NOT_NUMBER';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.coverPercentage = '2.0';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));
  });

  it('shows error message if cover percentage value is not between 1 and 80', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityValueResponse = new MockFacilityValueResponse();

    mockRequest.body.coverPercentage = '0';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.coverPercentage = '81';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.coverPercentage = '80';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));
  });

  it('shows error message if interest percentage value is not a number', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityValueResponse = new MockFacilityValueResponse();

    mockRequest.body.interestPercentage = 'abc';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
      }),
    }));
  });

  it('shows error message if interest percentage value is not between 0 and 100', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityValueResponse = new MockFacilityValueResponse();

    mockRequest.body.interestPercentage = '-1';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.interestPercentage = '101';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.interestPercentage = '100';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/facility-value.njk');
  });

  it('calls the update api with the correct data and redirects user back to application page', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

    mockRequest.body.coverPercentage = '79';
    mockRequest.body.interestPercentage = '10';
    mockRequest.body.value = '1000';

    await updateFacilityValue(mockRequest, mockResponse);

    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      coverPercentage: '79',
      interestPercentage: '10',
      value: '1000',
    });

    expect(mockResponse.redirect).toHaveBeenCalledWith(FACILITY_GUARANTEE_URL);
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    mockRequest.body.currency = 'EUR';
    mockRequest.body.coverPercentage = '79';
    mockRequest.body.interestPercentage = '10';
    mockRequest.body.value = '1000';

    api.updateFacility = () => Promise.reject();
    await updateFacilityValue(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Save and return validation', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityValueResponse;

  beforeEach(() => {
    mockResponse = new MockResponse();
    mockRequest = new MockRequest(true);
    mockFacilityValueResponse = new MockFacilityValueResponse();
  });

  it('shows error message if cover percentage value is not a number', async () => {
    mockRequest.body.coverPercentage = 'NOT_NUMBER';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.coverPercentage = '2.0';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));
  });

  it('shows error message if cover percentage value is not a number', async () => {
    mockRequest.body.coverPercentage = 'NOT_NUMBER';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.coverPercentage = '2.0';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));
  });

  it('does not show an error message if cover percentage value is blank', async () => {
    mockRequest.body.coverPercentage = '';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith(APPLICATION_URL);

    jest.clearAllMocks();

    mockRequest.body.coverPercentage = '99';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.coverPercentage = '80';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
      }),
    }));
  });

  it('shows error message if interest percentage value is not a number', async () => {
    mockRequest.body.interestPercentage = 'abc';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
      }),
    }));
  });

  it('shows error message if interest percentage value is not between 0 and 100', async () => {
    mockRequest.body.interestPercentage = '-1';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.interestPercentage = '101';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-value.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.interestPercentage = '100';

    api.updateFacility = () => Promise.resolve(mockFacilityValueResponse);
    await updateFacilityValue(mockRequest, mockResponse);

    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/facility-value.njk');
  });

  it('calls the update api with the correct data and redirects user to the application page', async () => {
    const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

    mockRequest.body.interestPercentage = '10';

    await updateFacilityValue(mockRequest, mockResponse);

    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      coverPercentage: null,
      interestPercentage: '10',
      value: null,
    });

    expect(mockResponse.redirect).toHaveBeenCalledWith(APPLICATION_URL);
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    mockRequest.body.currency = 'EUR';
    mockRequest.body.coverPercentage = '79';
    mockRequest.body.interestPercentage = '10';
    mockRequest.body.value = '1000';

    api.updateFacility = () => Promise.reject();
    await updateFacilityValue(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
