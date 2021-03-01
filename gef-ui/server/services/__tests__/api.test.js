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
});

describe('getMandatoryCriteria()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getMandatoryCriteria();
    expect(response).toEqual({ status: 200 });
  });
});

describe('createApplication()', () => {
  it('returns the correct response', async () => {
    Axios.post.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.createApplication();
    expect(response).toEqual({ status: 200 });
  });
});

describe('getApplication()', () => {
  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getApplication();
    expect(response).toEqual({ status: 200 });
  });
});

describe('getExporter()', () => {
  it('returns an empty object if there is no exporterId param', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getExporter();
    expect(response).toEqual({});
  });

  it('returns the correct response', async () => {
    Axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getExporter('fakeId');
    expect(response).toEqual({ status: 200 });
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
});
