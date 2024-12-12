const { isAutomaticSalesforceCustomerCreationFeatureFlagEnabled } = require('@ukef/dtfs2-common');
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
  isAutomaticSalesforceCustomerCreationFeatureFlagEnabled: jest.fn(),
}));

describe('when automatic Salesforce customer creation feature flag is disabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isAutomaticSalesforceCustomerCreationFeatureFlagEnabled).mockReturnValue(false);
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
});

describe('when automatic Salesforce customer creation feature flag is enabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isAutomaticSalesforceCustomerCreationFeatureFlagEnabled).mockReturnValue(true);
  });

  it.each([
    {
      query: {
        companyName: 'TEST NAME',
      },
    },
    {
      query: {
        companyRegNo: '12345678',
      },
    },
    {
      query: {},
    },
  ])('should not call apim, and return an empty string if inputs are missing', async ({ query }) => {
    const result = await api.getPartyUrn(query);
    expect(result).toBe('');

    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
  });

  it('should return an empty string if no companyRegNo is provided', async () => {
    const result = await api.getPartyUrn({ companyName: 'TEST NAME', probabilityOfDefault: 14 });
    expect(result).toBe('');
  });

  it('should return an empty string if no companyName is provided', async () => {
    const result = await api.getPartyUrn({ companyRegNo: '12345678', probabilityOfDefault: 14 });
    expect(result).toBe('');
  });

  it('should return an empty string if no probabilityOfDefault is provided', async () => {
    const result = await api.getPartyUrn({ companyRegNo: '12345678', companyName: 'TEST NAME' });
    expect(result).toBe('');
  });

  it('should return an empty string if no inputs are provided', async () => {
    const result = await api.getPartyUrn({});
    expect(result).toBe('');
  });

  it('should call getOrCreatePartyDbInfo for a company that exists, and return urn', async () => {
    getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

    const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 14 };

    const result = await api.getPartyUrn(companyData);

    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(companyData);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('TEST_URN');
  });

  it('should not call getPartyDbInfo', async () => {
    getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

    const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 14 };

    await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledTimes(0);
  });

  it('should return an empty string if getOrCreatePartyDbInfo returns false', async () => {
    getOrCreatePartyDbInfo.mockResolvedValue(false);

    const companyData = { companyRegNo: '12345678', companyName: 'TEST NAME', probabilityOfDefault: 14 };

    const result = await api.getPartyUrn(companyData);

    expect(result).toBe('');
  });

  it('should handle null partyUrn in creation response gracefully', async () => {
    getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: null }]);

    const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 14 };

    const result = await api.getPartyUrn(companyData);

    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(companyData);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });

  it('should handle null data in getOrCreatePartyDbInfo response gracefully', async () => {
    getOrCreatePartyDbInfo.mockResolvedValue({});

    const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 14 };

    const result = await api.getPartyUrn(companyData);

    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(companyData);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });
});
