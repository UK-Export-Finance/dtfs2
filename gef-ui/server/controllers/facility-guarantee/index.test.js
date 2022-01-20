import { facilityGuarantee, updateFacilityGuarantee } from './index';
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
  req.session = {
    user: {
      bank: { id: 'BANK_ID' },
      roles: ['MAKER'],
    },
    userToken: 'secret-token',
  };
  req.params.dealId = '123';
  req.params.facilityId = 'xyz';
  return req;
};

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporter = {};
  res.bank = { id: 'BANK_ID' };
  res.bankInternalRefName = 'My test';
  res.status = CONSTANTS.DEAL_STATUS.DRAFT;
  return res;
};

const MockFacilityResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

describe('controllers/facility-guarantee', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockFacilityResponse = MockFacilityResponse();

    api.getApplication.mockResolvedValue(MockApplicationResponse());
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue(mockFacilityResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Facility Guarantee', () => {
    it('renders the `Facility Guarantee` template', async () => {
      mockRequest.query.status = 'change';
      mockFacilityResponse.details.feeFrequency = 'Monthly';
      mockFacilityResponse.details.dayCountBasis = '365';
      mockFacilityResponse.details.feeType = CONSTANTS.FACILITY_PAYMENT_TYPE.IN_ADVANCE;

      api.getFacility.mockResolvedValueOnce(mockFacilityResponse);

      await facilityGuarantee(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-guarantee.njk', expect.objectContaining({
        inArrearsFrequency: '',
        inAdvanceFrequency: 'Monthly',
        dayCountBasis: '365',
        feeType: CONSTANTS.FACILITY_PAYMENT_TYPE.IN_ADVANCE,
        dealId: '123',
        facilityId: 'xyz',
      }));
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      api.getFacility.mockRejectedValueOnce();

      await facilityGuarantee(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Update Facility Guarantee', () => {
    it('shows error message if any fields are not selected', async () => {
      mockRequest.body.dayCountBasis = '365';

      await updateFacilityGuarantee(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-guarantee.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#feeType', text: expect.any(String) }]),
        }),
      }));

      jest.resetAllMocks();

      mockRequest.body.feeType = CONSTANTS.FACILITY_PAYMENT_TYPE.IN_ADVANCE;
      mockRequest.body.feeFrequency = 'Monthly';
      mockRequest.body.dayCountBasis = '';

      await updateFacilityGuarantee(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/facility-guarantee.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#dayCountBasis', text: expect.any(String) }]),
        }),
      }));
    });

    it('calls the update api with the correct data and redirects user back to application page', async () => {
      mockRequest.body.feeType = CONSTANTS.FACILITY_PAYMENT_TYPE.IN_ADVANCE;
      mockRequest.body.dayCountBasis = '365';
      mockRequest.body.inAdvanceFrequency = 'Monthly';

      await updateFacilityGuarantee(mockRequest, mockResponse);

      expect(api.updateFacility).toHaveBeenCalledWith('xyz', {
        feeType: CONSTANTS.FACILITY_PAYMENT_TYPE.IN_ADVANCE,
        paymentType: 'Monthly',
        dayCountBasis: '365',
        feeFrequency: 'Monthly',
      });

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      mockRequest.body.feeType = CONSTANTS.FACILITY_PAYMENT_TYPE.IN_ADVANCE;
      mockRequest.body.dayCountBasis = '365';
      mockRequest.body.inAdvanceFrequency = 'Monthly';

      api.updateFacility.mockRejectedValueOnce();

      await updateFacilityGuarantee(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
