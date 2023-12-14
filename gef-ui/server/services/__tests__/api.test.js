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
    Axios.get.mockReturnValue(Promise.resolve({ status: 200 }));
    const response = await api.validateToken(userToken);
    expect(response).toBeTruthy();
  });

  it('returns `false` if token is not valid', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ status: 400 }));
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
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getMandatoryCriteria({ userToken });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    const response = api.getMandatoryCriteria({ userToken });
    await expect(response).rejects.toThrowError();
  });
});

describe('createApplication()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.createApplication({ payload: {}, userToken });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    const response = api.createApplication({ payload: {}, userToken });
    await expect(response).rejects.toThrowError();
  });
});

describe('cloneApplication()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.cloneApplication({ payload: {}, userToken });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    const response = api.cloneApplication({ payload: {}, userToken });
    await expect(response).rejects.toThrowError();
  });
});

describe('getApplication()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getApplication({ dealId: validMongoId, userToken });
    expect(response).toEqual({ status: 200 });
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
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateApplication({ dealId: validMongoId, application: {}, userToken });
    expect(response).toEqual({ status: 200 });
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
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateSupportingInformation({ dealId: validMongoId, application: {}, userToken });
    expect(response).toEqual({ status: 200 });
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
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.setApplicationStatus({
      dealId: validMongoId,
      status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL,
      userToken,
    });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(
      api.setApplicationStatus({ dealId: validMongoId, status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL, userToken }),
    ).rejects.toThrowError();
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
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacilities({ userToken });
    expect(response).toEqual([]);
  });

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacilities({ dealId: validMongoId, userToken });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacilities({ dealId: validMongoId, userToken })).rejects.toThrowError();
  });
});

describe('getFacility()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacility({ facilityId: validMongoId, userToken });
    expect(response).toEqual({ status: 200 });
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
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.createFacility({ payload: {}, userToken });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    await expect(api.createFacility({ payload: {}, userToken })).rejects.toThrowError();
  });
});

describe('updateFacility()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateFacility({ facilityId: validMongoId, payload: {}, userToken });
    expect(response).toEqual({ status: 200 });
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
    Axios.delete.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.deleteFacility({ facilityId: validMongoId, userToken });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.delete.mockReturnValue(Promise.reject());
    await expect(api.deleteFacility({ facilityId: validMongoId, userToken })).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid facilityId', async (invalidMongoId) => {
    const response = await api.deleteFacility({ facilityId: invalidMongoId, userToken });
    expect(response).toEqual(false);
  });
});

describe('getCompaniesHouseDetails()', () => {
  const companiesHouseNumber = '03827491';

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getCompaniesHouseDetails({ companyRegNumber: companiesHouseNumber, userToken });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(
      api.getCompaniesHouseDetails({ companyRegNumber: companiesHouseNumber, userToken }),
    ).rejects.toThrowError();
  });

  it('throws an appropriate error when given an invalid companiesHouseNumber', async () => {
    await expect(api.getCompaniesHouseDetails({ companyRegNumber: 'invalid', userToken })).rejects.toThrowError(
      'Invalid company house number',
    );
  });
});

describe('getAddressesByPostcode()', () => {
  const postcode = 'EE1 1EE';

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getAddressesByPostcode({ postcode, userToken });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getAddressesByPostcode({ postcode, userToken })).rejects.toThrowError();
  });

  it('throws an appropriate error when given an invalid postcode', async () => {
    await expect(api.getAddressesByPostcode({ postcode: 'invalid', userToken })).rejects.toThrowError(
      'Invalid postcode',
    );
  });
});
