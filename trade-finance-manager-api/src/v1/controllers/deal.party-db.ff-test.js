const { getPartyDbInfo, getOrCreatePartyDbInfo } = require('../api.js');

const api = require('./deal.party-db');
const { PROBABILITY_OF_DEFAULT } = require('../../constants/deals.js');

const mockCompany = {
  partyUrn: '1234',
  name: 'Test',
  sfId: '0',
  companyRegNo: 'ABC123',
  type: null,
  subtype: null,
  isLegacyRecord: false,
};

console.error = jest.fn();

const res = {
  redirect: jest.fn(),
  render: jest.fn(),
  status: jest.fn(),
};

const req = {
  params: {
    urn: '',
  },
};

describe('getCompany returns false', () => {
  it('should return `false` on an empty URN', async () => {
    const result = await api.getCompany(req, res);
    expect(result).toEqual(false);
  });

  it('should return `false` on an non-existent URN', async () => {
    req.params.urn = '12345';

    const result = await api.getCompany(req, res);
    expect(result).toEqual(false);
  });
});

describe('getCompany returns company', () => {
  beforeEach(() => {
    api.getCompany = () =>
      Promise.resolve({
        status: 200,
        data: mockCompany,
      });
  });

  it('should return company', async () => {
    req.params.urn = '12344';

    const result = await api.getCompany(req, res);

    expect(result.status).toEqual(200);
    expect(result.data).toEqual(mockCompany);
  });
});

jest.mock('../api.js', () => ({
  getPartyDbInfo: jest.fn(),
  getOrCreatePartyDbInfo: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const invalidQueryParameters = [
  {
    query: {
      companyName: 'TEST NAME',
      companyRegNo: '12345678',
    },
  },
  {
    query: {
      companyRegNo: '12345678',
      probabilityOfDefault: 3,
    },
  },
  {
    query: {
      companyName: 'TEST NAME',
      probabilityOfDefault: 3,
    },
  },
  {
    query: {},
  },
];

it.each(invalidQueryParameters)('should not call apim, and return an empty string if inputs are missing', async ({ query }) => {
  const result = await api.getPartyUrn(query);
  expect(result).toBe('');

  expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
});

it('should call getOrCreatePartyDbInfo for a company that exists (or does not exist and is created with a new URN), and return URN', async () => {
  getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

  const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 3 };

  const result = await api.getPartyUrn(companyData);

  expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(companyData);
  expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

  expect(result).toBe('TEST_URN');
});

it('should allow a probability of default set to its default value', async () => {
  getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

  const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE };

  const result = await api.getPartyUrn(companyData);

  expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(companyData);
  expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

  expect(result).toBe('TEST_URN');
});

it('should allow a probability of default set to undefined', async () => {
  getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

  const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: undefined };

  const result = await api.getPartyUrn(companyData);

  expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(companyData);
  expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

  expect(result).toBe('TEST_URN');
});

it('should not call getPartyDbInfo', async () => {
  getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

  const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 3 };

  await api.getPartyUrn(companyData);

  expect(getPartyDbInfo).toHaveBeenCalledTimes(0);
});

it('should return an empty string if getOrCreatePartyDbInfo returns false', async () => {
  getOrCreatePartyDbInfo.mockResolvedValue(false);

  const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 3 };

  const result = await api.getPartyUrn(companyData);

  const expectedErrorMessage = 'No partyDbInfo returned';
  expect(console.error).toHaveBeenCalledWith(expectedErrorMessage);
  expect(result).toBe('');
});

it('should handle null partyUrn in creation response gracefully', async () => {
  getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: null }]);

  const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 3 };

  const result = await api.getPartyUrn(companyData);

  expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(companyData);
  expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

  const expectedErrorMessage = 'No PartyURN in response';
  expect(console.error).toHaveBeenCalledWith(expectedErrorMessage);
  expect(result).toBe('');
});

it('should handle null data in getOrCreatePartyDbInfo response gracefully', async () => {
  getOrCreatePartyDbInfo.mockResolvedValue({});

  const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 3 };

  const result = await api.getPartyUrn(companyData);

  expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(companyData);
  expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

  const expectedErrorMessage = 'No PartyURN in response';
  expect(console.error).toHaveBeenCalledWith(expectedErrorMessage);
  expect(result).toBe('');
});
