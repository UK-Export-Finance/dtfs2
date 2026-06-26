const { isSalesforceCustomerCreationEnabled } = require('@ukef/dtfs2-common');
const { getPartyDbInfo, getOrCreatePartyDbInfo, updateDeal } = require('../api.js');

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

const mockDeal = {
  _id: 'deal-123',
  exporter: {
    companyName: 'Test Company',
    companiesHouseRegistrationNumber: '12345678',
    probabilityOfDefault: 0.5,
    selectedIndustry: { code: '1234' },
    registeredAddress: { country: 'GBR' },
  },
  tfm: {},
};

describe('getCompany returns false', () => {
  it('should return `false` on an empty URN', async () => {
    // Act
    const result = await api.getCompany(req, res);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return `false` on an non-existent URN', async () => {
    // Arrange
    req.params.urn = '12345';

    // Act
    const result = await api.getCompany(req, res);

    // Assert
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
    // Arrange
    req.params.urn = '12344';

    // Act
    const result = await api.getCompany(req, res);

    // Assert
    expect(result.status).toEqual(200);
    expect(result.data).toEqual(mockCompany);
  });
});

jest.mock('../api.js', () => ({
  getPartyDbInfo: jest.fn(),
  getOrCreatePartyDbInfo: jest.fn(),
  updateDeal: jest.fn(),
}));

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isSalesforceCustomerCreationEnabled: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('extractPartyUrn', () => {
  it('should return the party URN from the first array item', () => {
    // Arrange
    const partyDbInfo = [{ partyUrn: 'ARRAY_URN' }];

    // Act
    const result = api.extractPartyUrn(partyDbInfo);

    // Assert
    expect(result).toBe('ARRAY_URN');
  });

  it('should return the party URN from a single object', () => {
    // Arrange
    const partyDbInfo = { partyUrn: 'OBJECT_URN' };

    // Act
    const result = api.extractPartyUrn(partyDbInfo);

    // Assert
    expect(result).toBe('OBJECT_URN');
  });

  it('should return the party URN from a nested data array', () => {
    // Arrange
    const partyDbInfo = {
      data: [{ partyUrn: 'NESTED_URN' }],
    };

    // Act
    const result = api.extractPartyUrn(partyDbInfo);

    // Assert
    expect(result).toBe('NESTED_URN');
  });

  it('should return an empty string when no party URN is present', () => {
    // Arrange
    const partyDbInfo = { data: [{}] };

    // Act
    const result = api.extractPartyUrn(partyDbInfo);

    // Assert
    expect(result).toBe('');
  });

  it('should return an empty string for null input', () => {
    // Act
    const result = api.extractPartyUrn(null);

    // Assert
    expect(result).toBe('');
  });

  it('should return an empty string for undefined input', () => {
    // Act
    const result = api.extractPartyUrn(undefined);

    // Assert
    expect(result).toBe('');
  });

  it('should return an empty string for an empty array', () => {
    // Act
    const result = api.extractPartyUrn([]);

    // Assert
    expect(result).toBe('');
  });

  it('should return an empty string for an empty data array', () => {
    // Arrange
    const partyDbInfo = { data: [] };

    // Act
    const result = api.extractPartyUrn(partyDbInfo);

    // Assert
    expect(result).toBe('');
  });

  it('should return an empty string for a plain object with no relevant properties', () => {
    // Arrange
    const partyDbInfo = { name: 'Test Ltd' };

    // Act
    const result = api.extractPartyUrn(partyDbInfo);

    // Assert
    expect(result).toBe('');
  });
});

describe('getPartyUrn', () => {
  it('should return an empty string if no companyRegNo is provided', async () => {
    // Act
    const result = await api.getPartyUrn({});

    // Assert
    expect(result).toBe('');
  });

  it('should call getPartyDbInfo and return urn', async () => {
    // Arrange
    getPartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);
    isSalesforceCustomerCreationEnabled.mockReturnValue(false);

    const companyData = { companyRegNo: '12345678' };

    // Act
    const result = await api.getPartyUrn(companyData);

    // Assert
    expect(getPartyDbInfo).toHaveBeenCalledWith(companyData);
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);
    expect(result).toBe('TEST_URN');
  });

  it('should not call getOrCreatePartyDbInfo', async () => {
    // Arrange
    getPartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);
    isSalesforceCustomerCreationEnabled.mockReturnValue(false);

    const companyData = { companyRegNo: '12345678' };

    // Act
    await api.getPartyUrn(companyData);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
  });

  it('should return an empty string if getPartyDbInfo returns false', async () => {
    // Arrange
    getPartyDbInfo.mockResolvedValue(false);
    isSalesforceCustomerCreationEnabled.mockReturnValue(false);

    const companyData = { companyRegNo: '12345678' };

    // Act
    const result = await api.getPartyUrn(companyData);

    // Assert
    expect(getPartyDbInfo).toHaveBeenCalledWith(companyData);
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);
    expect(result).toBe('');
  });
});

describe('addPartyUrns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false if deal does not have exporter', async () => {
    // Arrange
    const deal = {};

    // Act
    const result = await api.addPartyUrns(deal, {});

    // Assert
    expect(result).toBe(false);
  });

  describe('when a party URN is successfully retrieved', () => {
    it('should return deal with newPartyUrnCreated flag set to true', async () => {
      // Arrange
      isSalesforceCustomerCreationEnabled.mockReturnValue(true);

      getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN_123' }]);

      updateDeal.mockResolvedValue({
        tfm: {
          parties: {
            exporter: { partyUrn: 'TEST_URN_123', partyUrnRequired: true },
            buyer: { partyUrn: '', partyUrnRequired: false },
            indemnifier: { partyUrn: '', partyUrnRequired: false },
            agent: { partyUrn: '', partyUrnRequired: false },
          },
        },
      });

      // Act
      const result = await api.addPartyUrns(mockDeal, {});

      // Assert
      expect(result).toHaveProperty('deal');
      expect(result).toHaveProperty('newPartyUrnCreated', true);
      expect(result.deal._id).toBe('deal-123');
    });
  });

  describe('when a party URN is empty', () => {
    it('should return deal with newPartyUrnCreated flag set to false', async () => {
      // Arrange
      isSalesforceCustomerCreationEnabled.mockReturnValue(false);

      getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: '' }]);

      updateDeal.mockResolvedValue({
        tfm: {
          parties: {
            exporter: { partyUrn: '', partyUrnRequired: true },
            buyer: { partyUrn: '', partyUrnRequired: false },
            indemnifier: { partyUrn: '', partyUrnRequired: false },
            agent: { partyUrn: '', partyUrnRequired: false },
          },
        },
      });

      // Act
      const result = await api.addPartyUrns(mockDeal, {});

      // Assert
      expect(result).toHaveProperty('newPartyUrnCreated', false);
    });
  });
});
