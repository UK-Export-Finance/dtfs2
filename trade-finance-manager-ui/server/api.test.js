import api from './api';

const { default: axios } = require('axios');

jest.mock('axios');

afterEach(() => {
  jest.clearAllMocks();
});

describe('getFacilities()', () => {
  it('returns the correct response', async () => {
    axios.get.mockReturnValue(Promise.resolve({ data: { status: 200 } }));
    const response = await api.getFacilities();
    expect(response).toEqual({ facilities: [] });
  });
});
