import { facilityGuarantee, updateFacilityGuarantee } from './index';
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

const MockFacilityGuaranteeResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Facility Guarantee', () => {
  it('renders the `Facility Guarantee` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockApplicationResponse = new MockApplicationResponse();
    const mockFacilityGuaranteeResponse = new MockFacilityGuaranteeResponse();

    mockRequest.query.status = 'change';
    mockFacilityGuaranteeResponse.details.frequency = 'Monthly';
    mockFacilityGuaranteeResponse.details.dayCountBasis = '365';
    mockFacilityGuaranteeResponse.details.feeType = 'in advance';
    api.getFacility = () => Promise.resolve(mockFacilityGuaranteeResponse);
    api.getApplication = () => Promise.resolve(mockApplicationResponse);

    await facilityGuarantee(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-guarantee.njk', expect.objectContaining({
      inArrearsFrequency: '',
      inAdvanceFrequency: 'Monthly',
      dayCountBasis: '365',
      feeType: 'in advance',
      applicationId: '123',
      facilityId: 'xyz',
      // status: 'change',
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getFacility = () => Promise.reject();
    await facilityGuarantee(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Update Facility Guarantee', () => {
  it('shows error message if any fields are not selected', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockFacilityGuaranteeResponse = new MockFacilityGuaranteeResponse();

    mockRequest.body.dayCountBasis = '365';

    api.updateFacility = () => Promise.resolve(mockFacilityGuaranteeResponse);
    await updateFacilityGuarantee(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-guarantee.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#feeType', text: expect.any(String) }]),
      }),
    }));

    jest.clearAllMocks();

    mockRequest.body.feeType = 'in advance';
    mockRequest.body.frequency = 'Monthly';
    mockRequest.body.dayCountBasis = '';

    api.updateFacility = () => Promise.resolve(mockFacilityGuaranteeResponse);
    await updateFacilityGuarantee(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-guarantee.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#dayCountBasis', text: expect.any(String) }]),
      }),
    }));
  });

  it('calls the update api with the correct data and redirects user back to application page', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

    mockRequest.body.feeType = 'in advance';
    mockRequest.body.dayCountBasis = '365';
    mockRequest.body.inAdvanceFrequency = 'Monthly';

    await updateFacilityGuarantee(mockRequest, mockResponse);

    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      feeType: 'in advance',
      dayCountBasis: '365',
      frequency: 'Monthly',
    });

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    mockRequest.body.feeType = 'in advance';
    mockRequest.body.dayCountBasis = '365';
    mockRequest.body.inAdvanceFrequency = 'Monthly';

    api.updateFacility = () => Promise.reject();
    await updateFacilityGuarantee(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});
