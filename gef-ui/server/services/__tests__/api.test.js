import { AxiosError, HttpStatusCode } from 'axios';
import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common';
import Axios from '../axios';
import api from '../api';
import CONSTANTS from '../../constants';

jest.mock('../axios');

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

  it.each(invalidMongoIdTestCases)('returns false when given an invalid facilityId', async (invalidMongoId) => {
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
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: HttpStatusCode.Ok } }));
    const response = await api.getAmendment({ facilityId: validMongoId, amendmentId: validMongoId, userToken });
    expect(response).toEqual({ status: HttpStatusCode.Ok });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject(new AxiosError()));
    await expect(api.getAmendment({ facilityId: validMongoId, amendmentId: validMongoId, userToken })).rejects.toThrowError(AxiosError);
  });

  it.each(invalidMongoIdTestCases)('throws an error when given an invalid facility Id', async (invalidMongoId) => {
    await expect(api.getAmendment({ facilityId: invalidMongoId, amendmentId: validMongoId, userToken })).rejects.toThrowError('Invalid facility ID');
  });

  it.each(invalidMongoIdTestCases)('throws an error when given an invalid amendment Id', async (invalidMongoId) => {
    await expect(api.getAmendment({ facilityId: validMongoId, amendmentId: invalidMongoId, userToken })).rejects.toThrowError('Invalid amendment ID');
  });
});
