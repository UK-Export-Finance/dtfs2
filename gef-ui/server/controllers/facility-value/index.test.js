import { CURRENCY } from '@ukef/dtfs2-common';
import { facilityValue, updateFacilityValue } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';
import { MAKER } from '../../constants/roles';

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const userToken = 'secret-token';
const MockRequest = (saveAndReturn = false) => {
  const req = {};
  req.params = {};
  req.query = { saveAndReturn };
  req.body = {};
  req.session = {
    user: {
      bank: { id: 'BANK_ID' },
      roles: [MAKER],
      _id: '12345',
    },
    userToken,
  };
  req.params.dealId = '123';
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
  res.exporter = {};
  res.bank = { id: 'BANK_ID' };
  res.bankInternalRefName = 'My test';
  res.status = CONSTANTS.DEAL_STATUS.DRAFT;
  return res;
};

describe('controllers/facility-value', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityValueResponse;
  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockFacilityValueResponse = MockFacilityValueResponse();

    api.getApplication.mockResolvedValue(MockApplicationResponse());
    api.getFacility.mockResolvedValue(mockFacilityValueResponse);
    api.updateFacility.mockResolvedValue(mockFacilityValueResponse);
    api.updateApplication = updateApplicationSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe.only('GET Facility Value', () => {
    it.only('renders the `Facility Value` template with no facility value', async () => {
      mockRequest.query.status = 'change';
      mockFacilityValueResponse.details.currency = { id: CURRENCY.GBP };
      mockFacilityValueResponse.details.type = CONSTANTS.FACILITY_TYPE.CASH;
      mockFacilityValueResponse.details.value = null;
      mockFacilityValueResponse.details.coverPercentage = null;
      mockFacilityValueResponse.details.interestPercentage = null;

      await facilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          currency: CURRENCY.GBP,
          value: '',
          facilityType: CONSTANTS.FACILITY_TYPE.CASH,
          coverPercentage: null,
          interestPercentage: null,
          facilityTypeString: 'cash',
          dealId: '123',
          facilityId: 'xyz',
          status: 'change',
        }),
      );
    });

    it('renders the `Facility Value` template with pre-existing facility value', async () => {
      mockRequest.query.status = 'change';
      mockFacilityValueResponse.details.currency = { id: CURRENCY.EUR };
      mockFacilityValueResponse.details.type = CONSTANTS.FACILITY_TYPE.CASH;
      mockFacilityValueResponse.details.value = 2000;
      mockFacilityValueResponse.details.coverPercentage = 20;
      mockFacilityValueResponse.details.interestPercentage = 10;

      await facilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          currency: CURRENCY.EUR,
          value: '2000',
          facilityType: CONSTANTS.FACILITY_TYPE.CASH,
          coverPercentage: '20',
          interestPercentage: '10',
          facilityTypeString: 'cash',
          dealId: '123',
          facilityId: 'xyz',
          status: 'change',
        }),
      );
    });

    it('redirects to currency page when no currency is set for this facility', async () => {
      await facilityValue(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/xyz/facility-currency');
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      api.getFacility.mockRejectedValueOnce();
      await facilityValue(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  const FACILITY_GUARANTEE_URL = '/gef/application-details/123/facilities/xyz/facility-guarantee';
  const APPLICATION_URL = '/gef/application-details/123';

  describe('Update Facility Value', () => {
    it('shows error message if cover percentage value is not a number', async () => {
      mockRequest.body.coverPercentage = 'NOT_NUMBER';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.coverPercentage = '2.0';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if cover percentage value is not between 1 and 80', async () => {
      mockRequest.body.coverPercentage = '0';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.coverPercentage = '81';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.coverPercentage = '80';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if interest percentage value is not a number', async () => {
      mockRequest.body.interestPercentage = 'abc';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if interest percentage value is not between 0 and 100', async () => {
      mockRequest.body.interestPercentage = '-1';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.interestPercentage = '101';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.interestPercentage = '100';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalledWith('partials/facility-value.njk');
    });

    it('calls the update api with the correct data and redirects user back to application page', async () => {
      mockRequest.body.coverPercentage = '79';
      mockRequest.body.interestPercentage = '10';
      mockRequest.body.value = '1000';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(api.updateFacility).toHaveBeenCalledWith({
        facilityId: 'xyz',
        payload: {
          coverPercentage: '79',
          interestPercentage: '10',
          value: '1000',
        },
        userToken,
      });

      expect(mockResponse.redirect).toHaveBeenCalledWith(FACILITY_GUARANTEE_URL);
    });

    it('calls api.updateApplication with editorId', async () => {
      mockRequest.body.coverPercentage = '79';
      mockRequest.body.interestPercentage = '10';
      mockRequest.body.value = '1000';

      await updateFacilityValue(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      mockRequest.body.currency = { id: 'EUR' };
      mockRequest.body.coverPercentage = '79';
      mockRequest.body.interestPercentage = '10';
      mockRequest.body.value = '1000';

      api.updateFacility.mockRejectedValueOnce();

      await updateFacilityValue(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Save and return validation', () => {
    beforeEach(() => {
      mockRequest = MockRequest(true);
    });

    it('shows error message if cover percentage value is not a number', async () => {
      mockRequest.body.coverPercentage = 'NOT_NUMBER';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.coverPercentage = '2.0';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if cover percentage value is not a number', async () => {
      mockRequest.body.coverPercentage = 'NOT_NUMBER';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.coverPercentage = '2.0';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('does not show an error message if cover percentage value is blank', async () => {
      mockRequest.body.coverPercentage = '';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(APPLICATION_URL);

      jest.resetAllMocks();

      mockRequest.body.coverPercentage = '99';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.coverPercentage = '80';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#coverPercentage', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if interest percentage value is not a number', async () => {
      mockRequest.body.interestPercentage = 'abc';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
          }),
        }),
      );
    });

    it('shows error message if interest percentage value is not between 0 and 100', async () => {
      mockRequest.body.interestPercentage = '-1';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.interestPercentage = '101';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/facility-value.njk',
        expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([{ href: '#interestPercentage', text: expect.any(String) }]),
          }),
        }),
      );

      jest.resetAllMocks();

      mockRequest.body.interestPercentage = '100';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalledWith('partials/facility-value.njk');
    });

    it('calls the update api with the correct data and redirects user to the application page', async () => {
      mockRequest.body.interestPercentage = '10';

      await updateFacilityValue(mockRequest, mockResponse);

      expect(api.updateFacility).toHaveBeenCalledWith({
        facilityId: 'xyz',
        payload: {
          coverPercentage: null,
          interestPercentage: '10',
          value: null,
        },
        userToken,
      });

      expect(mockResponse.redirect).toHaveBeenCalledWith(APPLICATION_URL);
    });

    it('calls api.updateApplication with editorId', async () => {
      mockRequest.body.interestPercentage = '10';

      await updateFacilityValue(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      mockRequest.body.currency = { id: 'EUR' };
      mockRequest.body.coverPercentage = '79';
      mockRequest.body.interestPercentage = '10';
      mockRequest.body.value = '1000';

      api.updateFacility.mockRejectedValueOnce();

      await updateFacilityValue(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });
});
