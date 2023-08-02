import Axios from '../axios';
import api from '../api';
import CONSTANTS from '../../constants';

jest.mock('../axios');

afterEach(() => {
  jest.clearAllMocks();
});

const validMongoId = 'ABCDEF123456789000000000';
const invalidMongoIdTestCases = ['../../../etc/passwd/', 'localhost', '{}', '[]', ''];

describe('validateToken()', () => {
  it('returns `true` if token is valid', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ status: 200 }));
    const response = await api.validateToken();
    expect(response).toBeTruthy();
  });

  it('returns `false` if token is not valid', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ status: 400 }));
    const response = await api.validateToken();
    expect(response).toBeFalsy();
  });

  it('returns `false` if there is an issue with the api', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    const response = await api.validateToken();
    expect(response).toBeFalsy();
  });
});

describe('getMandatoryCriteria()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getMandatoryCriteria();
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    const response = api.getMandatoryCriteria();
    await expect(response).rejects.toThrowError();
  });
});

describe('createApplication()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.createApplication();
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    const response = api.createApplication();
    await expect(response).rejects.toThrowError();
  });
});

describe('cloneApplication()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.cloneApplication();
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    const response = api.cloneApplication();
    await expect(response).rejects.toThrowError();
  });
});

describe('getApplication()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getApplication(validMongoId);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getApplication(validMongoId)).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid dealId', async (invalidMongoId) => {
    const response = await api.getApplication(invalidMongoId);
    expect(response).toEqual(false);
  });
});

describe('updateApplication()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateApplication(validMongoId, {});
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateApplication(validMongoId)).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid dealId', async (invalidMongoId) => {
    const response = await api.updateApplication(invalidMongoId);
    expect(response).toEqual(false);
  });
});

describe('updateSupportingInformation()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateSupportingInformation(validMongoId, {});
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateSupportingInformation(validMongoId)).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid dealId', async (invalidMongoId) => {
    const response = await api.updateSupportingInformation(invalidMongoId);
    expect(response).toEqual(false);
  });
});

describe('setApplicationStatus()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.setApplicationStatus(validMongoId, { status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.setApplicationStatus(validMongoId, { status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL })).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid dealId', async (invalidMongoId) => {
    const response = await api.setApplicationStatus(invalidMongoId);
    expect(response).toEqual(false);
  });
});

describe('getFacilities()', () => {
  it('returns an empty Array if no application Id is passed', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacilities();
    expect(response).toEqual([]);
  });

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacilities(validMongoId);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacilities(validMongoId)).rejects.toThrowError();
  });
});

describe('getFacility()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacility(validMongoId);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacility(validMongoId)).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid facilityId', async (invalidMongoId) => {
    const response = await api.getFacility(invalidMongoId);
    expect(response).toEqual(false);
  });
});

describe('createFacility()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.createFacility();
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.post.mockReturnValue(Promise.reject());
    await expect(api.createFacility()).rejects.toThrowError();
  });
});

describe('updateFacility()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateFacility(validMongoId, { payload: 'payload' });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateFacility(validMongoId)).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid facilityId', async (invalidMongoId) => {
    const response = await api.updateFacility(invalidMongoId, { payload: 'payload' });
    expect(response).toEqual(false);
  });
});

describe('deleteFacility()', () => {
  it('returns the correct response', async () => {
    Axios.delete.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.deleteFacility(validMongoId);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.delete.mockReturnValue(Promise.reject());
    await expect(api.deleteFacility(validMongoId)).rejects.toThrowError();
  });

  test.each(invalidMongoIdTestCases)('returns false when given an invalid facilityId', async (invalidMongoId) => {
    const response = await api.deleteFacility(invalidMongoId);
    expect(response).toEqual(false);
  });
});

describe('getEligibilityCriteria()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getEligibilityCriteria();
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getEligibilityCriteria()).rejects.toThrowError();
  });
});

describe('getCompaniesHouseDetails()', () => {
  const companiesHouseNumber = '03827491';

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getCompaniesHouseDetails(companiesHouseNumber);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getCompaniesHouseDetails(companiesHouseNumber)).rejects.toThrowError();
  });

  it('throws an appropriate error when given an invalid companiesHouseNumber', async () => {
    await expect(api.getCompaniesHouseDetails('invalid')).rejects.toThrowError('Invalid company house number');
  });
});

describe('getAddressesByPostcode()', () => {
  const postcode = 'EE1 1EE';

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getAddressesByPostcode(postcode);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getAddressesByPostcode(postcode)).rejects.toThrowError();
  });

  it('throws an appropriate error when given an invalid postcode', async () => {
    await expect(api.getAddressesByPostcode('invalid')).rejects.toThrowError('Invalid postcode');
  });
});
