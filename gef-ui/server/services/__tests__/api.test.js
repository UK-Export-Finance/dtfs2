import Axios from '../axios';
import api from '../api';
import CONSTANTS from '../../constants';

jest.mock('../axios');

afterEach(() => {
  jest.clearAllMocks();
});

const fakeMongoId = 'ABCDEF123456789000000000';

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
    const response = await api.getApplication(fakeMongoId);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getApplication(fakeMongoId)).rejects.toThrowError();
  });
});

describe('updateApplication()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateApplication(fakeMongoId, {});
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateApplication(fakeMongoId)).rejects.toThrowError();
  });
});

describe('updateSupportingInformation()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateSupportingInformation(fakeMongoId, {});
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateSupportingInformation(fakeMongoId)).rejects.toThrowError();
  });
});

describe('setApplicationStatus()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.setApplicationStatus(fakeMongoId, { status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.setApplicationStatus(fakeMongoId, { status: CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL })).rejects.toThrowError();
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
    const response = await api.getFacilities(fakeMongoId);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacilities(fakeMongoId)).rejects.toThrowError();
  });
});

describe('getFacility()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacility(fakeMongoId);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacility(fakeMongoId)).rejects.toThrowError();
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
    const response = await api.updateFacility(fakeMongoId, { payload: 'payload' });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateFacility(fakeMongoId)).rejects.toThrowError();
  });
});

describe('deleteFacility()', () => {
  it('returns the correct response', async () => {
    Axios.delete.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.deleteFacility(fakeMongoId);
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.delete.mockReturnValue(Promise.reject());
    await expect(api.deleteFacility(fakeMongoId)).rejects.toThrowError();
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
});
