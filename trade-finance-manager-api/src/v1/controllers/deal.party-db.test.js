const { getPartyDbInfo, getOrCreatePartyDbInfo } = require('../api.js');

const api = require('./deal.party-db');

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

describe('getPartyUrn', () => {
  it('should return an empty string if no companyRegNo is provided', async () => {
    const result = await api.getPartyUrn({});
    expect(result).toBe('');
  });

  it('should call getPartyDbInfo and return urn', async () => {
    getPartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

    const companyData = { companyRegNo: '12345678' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith(companyData);
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('TEST_URN');
  });

  it('should not call getOrCreatePartyDbInfo', async () => {
    getPartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

    const companyData = { companyRegNo: '12345678' };

    await api.getPartyUrn(companyData);

    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
  });

  it('should return an empty string if getPartyDbInfo returns false', async () => {
    getPartyDbInfo.mockResolvedValue(false);

    const companyData = { companyRegNo: '12345678' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith(companyData);
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });
});
