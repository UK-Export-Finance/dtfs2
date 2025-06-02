import { AxiosError, HttpStatusCode } from 'axios';
import {
  InvalidDealIdError,
  InvalidFacilityIdError,
  MOCK_COMPANY_REGISTRATION_NUMBERS,
  PORTAL_AMENDMENT_STATUS,
  PORTAL_AMENDMENT_INPROGRESS_STATUSES,
} from '@ukef/dtfs2-common';
import Axios from '../axios';
import api, { getTfmDeal } from '../api';
import CONSTANTS from '../../constants';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../test-helpers/mock-amendment';

jest.mock('../axios');
console.error = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});

const validMongoId = 'ABCDEF123456789000000000';
const invalidMongoIdTestCases = ['../../../etc/passwd/', 'localhost', '{}', '[]', ''];
const userToken = 'test-token';

describe('validateToken()', () => {
  it('returns `true` if token is valid', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ status: HttpStatusCode.Ok }));
    const response = await api.validateToken(userToken);
    expect(response).toBeTruthy();
  });

  it('returns `false` if token is not valid', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ status: HttpStatusCode.BadRequest }));
    const response = await api.validateToken(userToken);
    expect(response).toBeFalsy();
  });

  it('returns `false` if there is an issue with the api', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    const response = await api.validateToken(userToken);
    expect(response).toBeFalsy();
  });
});

describe('getMandatoryCriteria()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.getMandatoryCriteria({ userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    const response = api.getMandatoryCriteria({ userToken });
    await expect(response).rejects.toThrowError();
  });
});

describe('createApplication()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.createApplication({ payload: {}, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    const response = api.createApplication({ payload: {}, userToken });
    await expect(response).rejects.toThrowError();
  });
});

describe('cloneApplication()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.cloneApplication({ payload: {}, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    const response = api.cloneApplication({ payload: {}, userToken });
    await expect(response).rejects.toThrowError();
  });
});

describe('getApplication()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.getApplication({ dealId: validMongoId, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getApplication({ dealId: validMongoId, userToken })).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid dealId', async (invalidMongoId) => {
    const response = await api.getApplication({ dealId: invalidMongoId, userToken });
    expect(response).toEqual(false);
  });
});

describe('updateApplication()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.updateApplication({ dealId: validMongoId, application: {}, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateApplication({ dealId: validMongoId, application: {}, userToken })).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid dealId', async (invalidMongoId) => {
    const response = await api.updateApplication({ dealId: invalidMongoId, application: {}, userToken });
    expect(response).toEqual(false);
  });
});

describe('updateSupportingInformation()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.updateSupportingInformation({ dealId: validMongoId, application: {}, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateSupportingInformation({ dealId: validMongoId, userToken })).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid dealId', async (invalidMongoId) => {
    const response = await api.updateSupportingInformation({ dealId: invalidMongoId, userToken });
    expect(response).toEqual(false);
  });
});

describe('setApplicationStatus()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.setApplicationStatus({
      dealId: validMongoId,
      status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL,
      userToken,
    });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.setApplicationStatus({ dealId: validMongoId, status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL, userToken })).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid dealId', async (invalidMongoId) => {
    const response = await api.setApplicationStatus({
      dealId: invalidMongoId,
      status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL,
      userToken,
    });
    expect(response).toEqual(false);
  });
});

describe('getFacilities()', () => {
  it('returns an empty Array if no application Id is passed', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.getFacilities({ userToken });
    expect(response).toEqual([]);
  });

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.getFacilities({ dealId: validMongoId, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacilities({ dealId: validMongoId, userToken })).rejects.toThrowError();
  });
});

describe('getFacility()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.getFacility({ facilityId: validMongoId, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacility({ facilityId: validMongoId, userToken })).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid facilityId', async (invalidMongoId) => {
    const response = await api.getFacility({ facilityId: invalidMongoId, userToken });
    expect(response).toEqual(false);
  });
});

describe('createFacility()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.createFacility({ payload: {}, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    await expect(api.createFacility({ payload: {}, userToken })).rejects.toThrowError();
  });
});

describe('updateFacility()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.updateFacility({ facilityId: validMongoId, payload: {}, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateFacility({ facilityId: validMongoId, payload: {}, userToken })).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid facilityId', async (invalidMongoId) => {
    const response = await api.updateFacility({ facilityId: invalidMongoId, payload: {}, userToken });
    expect(response).toEqual(false);
  });
});

describe('deleteFacility()', () => {
  it('returns the correct response', async () => {
    Axios.delete.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.deleteFacility({ facilityId: validMongoId, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.delete.mockReturnValue(Promise.reject());
    await expect(api.deleteFacility({ facilityId: validMongoId, userToken })).rejects.toThrowError();
  });

  it.each(invalidMongoIdTestCases)('should return false when given an invalid facilityId', async (invalidMongoId) => {
    const response = await api.deleteFacility({ facilityId: invalidMongoId, userToken });
    expect(response).toEqual(false);
  });
});

describe('getCompanyByRegistrationNumber()', () => {
  const registrationNumber = MOCK_COMPANY_REGISTRATION_NUMBERS.VALID;

  const portalApiGetCompanyResponse = {
    companiesHouseRegistrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.VALID,
    companyName: 'TEST COMPANY LTD',
    registeredAddress: {
      addressLine1: '1 Test Street',
      locality: 'Test City',
      postalCode: 'A1 2BC',
      country: 'United Kingdom',
    },
    industries: [],
  };

  const apiErrorCases = [
    {
      status: HttpStatusCode.BadRequest,
      errMsg: 'Enter a valid Companies House registration number',
    },
    {
      status: HttpStatusCode.NotFound,
      errMsg: 'No company matching the Companies House registration number entered was found',
    },
    {
      status: HttpStatusCode.UnprocessableEntity,
      errMsg: 'UKEF can only process applications from companies based in the UK',
    },
  ];

  it('returns the company if it is returned by the request to Portal API', async () => {
    Axios.get.mockResolvedValueOnce({ status: HttpStatusCode.Ok, data: portalApiGetCompanyResponse });

    const response = await api.getCompanyByRegistrationNumber({ registrationNumber, userToken });

    expect(response).toEqual({ company: portalApiGetCompanyResponse });
  });

  it('returns the correct error information if it is called without a registration number', async () => {
    const response = await api.getCompanyByRegistrationNumber({ userToken });

    expect(response).toEqual({
      errRef: 'regNumber',
      errMsg: 'Enter a Companies House registration number',
    });
  });

  it('returns the correct error information if it is called with a null registration number', async () => {
    const response = await api.getCompanyByRegistrationNumber({ registrationNumber: null, userToken });

    expect(response).toEqual({
      errRef: 'regNumber',
      errMsg: 'Enter a Companies House registration number',
    });
  });

  it('returns the correct error information if it is called with a registration number that is the empty string', async () => {
    const response = await api.getCompanyByRegistrationNumber({ registrationNumber: '', userToken });

    expect(response).toEqual({
      errRef: 'regNumber',
      errMsg: 'Enter a Companies House registration number',
    });
  });

  it('returns the correct error information if it is called with an invalid registration number', async () => {
    const response = await api.getCompanyByRegistrationNumber({ registrationNumber: MOCK_COMPANY_REGISTRATION_NUMBERS.INVALID_TOO_SHORT, userToken });

    expect(response).toEqual({
      errRef: 'regNumber',
      errMsg: 'Enter a valid Companies House registration number',
    });
  });

  it.each(apiErrorCases)('returns the correct error information if the request to Portal API returns a $status', async ({ status, errMsg }) => {
    const axiosError = new AxiosError();
    axiosError.response = {
      status,
    };
    Axios.get.mockRejectedValueOnce(axiosError);

    const response = await api.getCompanyByRegistrationNumber({ registrationNumber, userToken });

    expect(response).toEqual({
      errRef: 'regNumber',
      errMsg,
    });
  });

  it('rethrows the error if the request to Portal API throws an error with an unhandled status', async () => {
    const axiosError = new AxiosError();
    axiosError.response = {
      status: HttpStatusCode.InternalServerError,
    };
    Axios.get.mockRejectedValueOnce(axiosError);

    await expect(api.getCompanyByRegistrationNumber({ registrationNumber, userToken })).rejects.toEqual(axiosError);
  });

  it('rethrows the error if making the request to Portal API throws an unhandled error', async () => {
    const error = new Error();
    Axios.get.mockRejectedValueOnce(error);

    await expect(api.getCompanyByRegistrationNumber({ registrationNumber, userToken })).rejects.toEqual(error);
  });
});

describe('getAddressesByPostcode()', () => {
  const postcode = 'EE1 1EE';

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.getAddressesByPostcode({ postcode, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getAddressesByPostcode({ postcode, userToken })).rejects.toThrowError();
  });

  it('throws an appropriate error when given an invalid postcode', async () => {
    await expect(api.getAddressesByPostcode({ postcode: 'invalid', userToken })).rejects.toThrowError('Invalid postcode');
  });
});

describe('getAmendment()', () => {
  it(`should parse the response body when the amendment can be found`, async () => {
    // Arrange
    const facilityEndDate = new Date();
    const mockAmendment = {
      ...new PortalFacilityAmendmentWithUkefIdMockBuilder().withIsUsingFacilityEndDate(true).build(),
      facilityEndDate: facilityEndDate.toISOString(),
    };

    Axios.get.mockReturnValue(Promise.resolve({ data: mockAmendment }));

    // Act
    const response = await api.getAmendment({ facilityId: validMongoId, amendmentId: validMongoId, userToken });

    // Assert
    expect(response).toEqual(new PortalFacilityAmendmentWithUkefIdMockBuilder().withFacilityEndDate(facilityEndDate).build());
  });

  it(`should throw an error if the response body cannot be parsed`, async () => {
    // Arrange
    const mockAmendment = {
      ...new PortalFacilityAmendmentWithUkefIdMockBuilder().withIsUsingFacilityEndDate(true).build(),
      facilityEndDate: 'Invalid',
    };
    Axios.get.mockReturnValue(Promise.resolve({ data: mockAmendment }));

    // Act + Assert
    await expect(api.getAmendment({ facilityId: validMongoId, amendmentId: validMongoId, userToken })).rejects.toThrow();
  });

  it('should throw an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject(new AxiosError()));
    await expect(api.getAmendment({ facilityId: validMongoId, amendmentId: validMongoId, userToken })).rejects.toThrow(AxiosError);
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid facility Id', async (invalidMongoId) => {
    await expect(api.getAmendment({ facilityId: invalidMongoId, amendmentId: validMongoId, userToken })).rejects.toThrow('Invalid facility ID');
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid amendment Id', async (invalidMongoId) => {
    await expect(api.getAmendment({ facilityId: validMongoId, amendmentId: invalidMongoId, userToken })).rejects.toThrow('Invalid amendment ID');
  });
});

describe('upsertAmendment()', () => {
  it(`should return the response body when the amendment can be upserted`, async () => {
    // Arrange
    const mockAmendment = { facilityId: validMongoId, amendmentId: validMongoId, dealId: validMongoId, changeCoverEndDate: true };
    Axios.put.mockReturnValue(Promise.resolve({ data: mockAmendment }));

    // Act
    const response = await api.upsertAmendment({ facilityId: validMongoId, dealId: validMongoId, amendment: {}, userToken });

    // Assert
    expect(response).toEqual(mockAmendment);
  });

  it('should throw an error if there is an api error', async () => {
    // Arrange
    Axios.put.mockReturnValue(Promise.reject(new AxiosError()));

    // Act
    const returned = api.upsertAmendment({ facilityId: validMongoId, dealId: validMongoId, amendment: {}, userToken });

    // Assert
    await expect(returned).rejects.toThrow(AxiosError);
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid deal Id', async (invalidMongoId) => {
    // Act
    const returned = api.upsertAmendment({ facilityId: validMongoId, dealId: invalidMongoId, amendment: {}, userToken });

    // Assert
    await expect(returned).rejects.toThrow(InvalidDealIdError);
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid facility Id', async (invalidMongoId) => {
    // Act
    const returned = api.upsertAmendment({ facilityId: invalidMongoId, dealId: validMongoId, amendment: {}, userToken });

    // Assert
    await expect(returned).rejects.toThrow(InvalidFacilityIdError);
  });
});

describe('updateAmendment()', () => {
  it(`should return the response body when the amendment can be updated`, async () => {
    // Arrange
    const mockAmendment = { facilityId: validMongoId, amendmentId: validMongoId, dealId: validMongoId, changeCoverEndDate: true };
    Axios.patch.mockReturnValue(Promise.resolve({ data: mockAmendment }));

    // Act
    const response = await api.updateAmendment({ facilityId: validMongoId, amendmentId: validMongoId, update: {}, userToken });

    // Assert
    expect(response).toEqual(mockAmendment);
  });

  it('should throw an error if there is an api error', async () => {
    // Arrange
    Axios.patch.mockReturnValue(Promise.reject(new AxiosError()));

    // Act
    const returned = api.updateAmendment({ facilityId: validMongoId, amendmentId: validMongoId, update: {}, userToken });

    // Assert
    await expect(returned).rejects.toThrow(AxiosError);
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid amendment Id', async (invalidMongoId) => {
    // Act
    const returned = api.updateAmendment({ facilityId: validMongoId, amendmentId: invalidMongoId, update: {}, userToken });

    // Assert
    await expect(returned).rejects.toThrow('Invalid amendment ID');
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid facility Id', async (invalidMongoId) => {
    // Act
    const returned = api.updateAmendment({ facilityId: invalidMongoId, amendmentId: validMongoId, update: {}, userToken });

    // Assert
    await expect(returned).rejects.toThrow(InvalidFacilityIdError);
  });
});

describe('deleteAmendment()', () => {
  it(`should return the correct response`, async () => {
    // Arrange
    Axios.delete.mockReturnValue(Promise.resolve(undefined));

    // Act
    await api.deleteAmendment({ facilityId: validMongoId, amendmentId: validMongoId, userToken });

    // Assert
    expect(Axios.delete).toHaveBeenCalledTimes(1);
    await expect(api.deleteAmendment({ facilityId: validMongoId, amendmentId: validMongoId, userToken })).resolves.toBeUndefined();
  });

  it('should throw an error if there is an api error', async () => {
    // Arrange
    Axios.delete.mockReturnValue(Promise.reject(new AxiosError('API Error')));

    // Act + Assert
    try {
      await api.deleteAmendment({ facilityId: validMongoId, amendmentId: validMongoId, userToken });
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      expect(error.message).toBe('API Error');
    }
    expect(Axios.delete).toHaveBeenCalledTimes(1);
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid amendment Id', async (invalidMongoId) => {
    // Act
    const returned = api.deleteAmendment({ facilityId: validMongoId, amendmentId: invalidMongoId, userToken });

    // Assert
    await expect(returned).rejects.toThrow('Invalid amendment ID');
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid facility Id', async (invalidMongoId) => {
    // Act
    const returned = api.deleteAmendment({ facilityId: invalidMongoId, amendmentId: validMongoId, userToken });

    // Assert
    await expect(returned).rejects.toThrow(InvalidFacilityIdError);
  });
});

describe('getAmendmentsOnDeal()', () => {
  it(`should return the found amendments`, async () => {
    // Arrange
    const mockAmendment = { ...new PortalFacilityAmendmentWithUkefIdMockBuilder().build(), status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL };
    Axios.get.mockResolvedValueOnce({ data: [mockAmendment] });

    // Act
    const response = await api.getAmendmentsOnDeal({ dealId: validMongoId, userToken, statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES });

    // Assert
    expect(response).toEqual([mockAmendment]);
  });

  it('should throw an error if there is an api error', async () => {
    // Arrange
    Axios.get.mockRejectedValueOnce(new AxiosError());

    // Act
    const returned = api.getAmendmentsOnDeal({ dealId: validMongoId, statuses: [PORTAL_AMENDMENT_STATUS.DRAFT], userToken });

    // Assert
    await expect(returned).rejects.toThrow(AxiosError);
  });

  it.each(invalidMongoIdTestCases)('should throw an error when given an invalid facility Id', async (invalidMongoId) => {
    // Act
    const returned = api.getAmendmentsOnDeal({ dealId: invalidMongoId, userToken });

    // Assert
    await expect(returned).rejects.toThrow(InvalidDealIdError);
  });
});

describe('getTfmDeal', () => {
  const invalidDealIds = ['', undefined, null, '123', 123, 'abc', '!@£', '123123123ABC', {}, []];
  const dealId = '61a7710b2ae62b0013dae687';

  describe('MongoID validation', () => {
    it.each(invalidDealIds)('should throw an error if an invalid Mongo deal ID `%s` is supplied', async (invalidDealId) => {
      // Arrange

      // Act
      const response = await getTfmDeal({ dealId: invalidDealId, userToken });

      // Assert
      expect(console.error).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith('Invalid deal ID %s', invalidDealId);
      expect(console.error).toHaveBeenCalledWith('Unable to get TFM deal %s %o', invalidDealId, new Error('Invalid deal ID'));
      expect(response).toBeFalsy();
    });
  });

  describe('API call', () => {
    it('should return TFM deal when a valid Mongo deal ID is supplied', async () => {
      // Arrange
      const deal = {
        _id: dealId,
        dealSnapshot: {
          dealId,
        },
        tfm: {},
      };

      const mockResponse = {
        data: {
          deal,
        },
      };

      Axios.get.mockResolvedValueOnce(mockResponse);

      // Act
      const response = await getTfmDeal({ dealId, userToken });

      // Assert
      expect(console.error).not.toHaveBeenCalled();
      expect(Axios.get).toHaveBeenCalledWith(`/tfm/deal/${dealId}`, {
        headers: { Authorization: userToken },
      });
      expect(response).toBe(mockResponse.data);
    });

    it('should return false when an empty response is received', async () => {
      // Arrange
      const mockError = new Error('Invalid TFM deal response received');
      const mockResponse = {};

      Axios.get.mockResolvedValueOnce(mockResponse);

      // Act
      const response = await getTfmDeal({ dealId, userToken });

      // Assert
      expect(Axios.get).toHaveBeenCalledWith(`/tfm/deal/${dealId}`, {
        headers: { Authorization: userToken },
      });
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get TFM deal %s %o', dealId, mockError);
      expect(response).toBeFalsy();
    });

    it('should return false when an undefined response is received', async () => {
      // Arrange
      const mockError = new Error('Invalid TFM deal response received');
      const mockResponse = undefined;

      Axios.get.mockResolvedValueOnce(mockResponse);

      // Act
      const response = await getTfmDeal({ dealId, userToken });

      // Assert
      expect(Axios.get).toHaveBeenCalledWith(`/tfm/deal/${dealId}`, {
        headers: { Authorization: userToken },
      });
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get TFM deal %s %o', dealId, mockError);
      expect(response).toBeFalsy();
    });

    it('should return false when a null response is received', async () => {
      // Arrange
      const mockError = new Error('Invalid TFM deal response received');
      const mockResponse = null;

      Axios.get.mockResolvedValueOnce(mockResponse);

      // Act
      const response = await getTfmDeal({ dealId, userToken });

      // Assert
      expect(Axios.get).toHaveBeenCalledWith(`/tfm/deal/${dealId}`, {
        headers: { Authorization: userToken },
      });
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get TFM deal %s %o', dealId, mockError);
      expect(response).toBeFalsy();
    });

    it('should return false when an empty data response is received', async () => {
      // Arrange
      const mockError = new Error('Invalid TFM deal response received');
      const mockResponse = {
        data: undefined,
      };

      Axios.get.mockResolvedValueOnce(mockResponse);

      // Act
      const response = await getTfmDeal({ dealId, userToken });

      // Assert
      expect(Axios.get).toHaveBeenCalledWith(`/tfm/deal/${dealId}`, {
        headers: { Authorization: userToken },
      });
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get TFM deal %s %o', dealId, mockError);
      expect(response).toBeFalsy();
    });
  });

  describe('Exception handling', () => {
    it('should catch an error if an exception is thrown', async () => {
      // Arrange
      const mockError = new Error('Test error');

      Axios.get.mockRejectedValueOnce(mockError);

      // Act
      const response = await getTfmDeal({ dealId, userToken });

      // Assert
      expect(Axios.get).toHaveBeenCalledWith(`/tfm/deal/${dealId}`, {
        headers: { Authorization: userToken },
      });
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Unable to get TFM deal %s %o', dealId, mockError);
      expect(response).toBeFalsy();
    });
  });
});
