import Axios from '../axios';
import * as api from '../api';

jest.mock('../axios');

afterEach(() => {
  jest.clearAllMocks();
});

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

describe('getApplication()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getApplication();
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getApplication()).rejects.toThrowError();
  });
});

describe('updateApplication()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateApplication('id', {});
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateApplication()).rejects.toThrowError();
  });
});

describe('getExporter()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getExporter('fakeId');
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    const response = api.getExporter();
    await expect(response).rejects.toThrowError();
  });
});

describe('updateExporter()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateExporter('fakeId', { payload: 'payload' });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    const response = api.updateExporter();
    await expect(response).rejects.toThrowError();
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
    const response = await api.getFacilities('fakeId');
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacilities('fakeId')).rejects.toThrowError();
  });
});

describe('getFacility()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacility('fakeId');
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getFacility('fakeId')).rejects.toThrowError();
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
    const response = await api.updateFacility('fakeId', { payload: 'payload' });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateFacility('fakeId')).rejects.toThrowError();
  });
});

describe('deleteFacility()', () => {
  it('returns the correct response', async () => {
    Axios.delete.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.deleteFacility('fakeId');
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.delete.mockReturnValue(Promise.reject());
    await expect(api.deleteFacility('fakeId')).rejects.toThrowError();
  });
});

describe('getCoverTerms()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getCoverTerms('fakeId');
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getCoverTerms('fakeId')).rejects.toThrowError();
  });
});

describe('updateCoverTerms()', () => {
  it('returns the correct response', async () => {
    Axios.put.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.updateCoverTerms('fakeId', { payload: 'payload' });
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.put.mockReturnValue(Promise.reject());
    await expect(api.updateCoverTerms('fakeId')).rejects.toThrowError();
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
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getCompaniesHouseDetails();
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getCompaniesHouseDetails()).rejects.toThrowError();
  });
});

describe('getAddressesByPostcode()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getAddressesByPostcode();
    expect(response).toEqual({ status: 200 });
  });

  it('throws an error if there is an api error', async () => {
    Axios.get.mockReturnValue(Promise.reject());
    await expect(api.getAddressesByPostcode()).rejects.toThrowError();
  });
});
