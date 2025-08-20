const { HttpStatusCode } = require('axios');
const { getPartyDbInfo, getOrCreatePartyDbInfo } = require('../api.js');
const { PROBABILITY_OF_DEFAULT } = require('../../constants/deals.js');
const api = require('./deal.party-db');

const invalidProbabilityOfDefaults = ['', null, undefined];
const falselyUrnResponses = [
  {},
  [],
  { data: {} },
  { data: 'error' },
  [{ partyUrn: '' }],
  [{ partyUrn: null }],
  [{ partyUrn: undefined }],
  [{ partyUrn: false }],
  [{ partyUrn: 0 }],
];
const falselyResponses = [null, undefined, false];

const mockCompany = {
  partyUrn: 'TEST_URN',
  name: 'Test',
  sfId: '0',
  companyRegNo: 'ABC123',
  type: null,
  subtype: null,
  isLegacyRecord: false,
};

const salesforceCustomer = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault: 3, isUkEntity: true, code: 10110 };

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

describe('getCompany', () => {
  describe('unhappy paths', () => {
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

  describe('happy paths', () => {
    beforeEach(() => {
      api.getCompany = () =>
        Promise.resolve({
          status: HttpStatusCode.Ok,
          data: mockCompany,
        });
    });

    it('should return company', async () => {
      // Arrange
      req.params.urn = '12344';

      // Act
      const result = await api.getCompany(req, res);

      // Assert
      expect(result.status).toEqual(HttpStatusCode.Ok);
      expect(result.data).toEqual(mockCompany);
    });
  });
});

describe('getOrCreatePartyDbInfo', () => {
  const invalidQueryParameters = [
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

  it.each(invalidQueryParameters)('should not call APIM, and return an empty string if inputs are missing', async ({ query }) => {
    // Act
    const result = await api.getPartyUrn(query);

    // Assert
    expect(result).toBe('');
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
  });

  it('should call getOrCreatePartyDbInfo for a company that exists (or does not exist and is created with a new URN), and return URN', async () => {
    // Arrange
    getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

    // Act
    const result = await api.getPartyUrn(salesforceCustomer);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(salesforceCustomer);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(0);

    expect(result).toBe('TEST_URN');
  });

  it('should allow a probability of default set to its default value', async () => {
    // Arrange
    getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

    const customer = {
      ...salesforceCustomer,
      probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE,
    };

    // Act
    const result = await api.getPartyUrn(customer);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(customer);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);
    expect(getPartyDbInfo).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(0);

    expect(result).toBe('TEST_URN');
  });

  it.each(invalidProbabilityOfDefaults)('should not allow a probability of default to be %s', async (probabilityOfDefault) => {
    // Arrange
    getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: '' }]);
    const companyData = { companyRegNo: '12345678', companyName: 'name', probabilityOfDefault };

    // Act
    const result = await api.getPartyUrn(companyData);

    // Assert
    expect(getOrCreatePartyDbInfo).not.toHaveBeenCalledWith(companyData);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
    expect(getPartyDbInfo).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('An invalid probability of default has been supplied');

    expect(result).toBe('');
  });

  it('should not allow a probability of default to be not defined in the payload', async () => {
    // Arrange
    getOrCreatePartyDbInfo.mockResolvedValue([{ partyUrn: '' }]);
    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    // Act
    const result = await api.getPartyUrn(companyData);

    // Assert
    expect(getOrCreatePartyDbInfo).not.toHaveBeenCalledWith(companyData);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
    expect(getPartyDbInfo).toHaveBeenCalledTimes(0);

    expect(console.error).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });

  it.each(falselyResponses)('should return an empty string party URN if getOrCreatePartyDbInfo returns an invalid response - %s', async (response) => {
    // Arrange
    getOrCreatePartyDbInfo.mockResolvedValue(response);

    // Act
    const result = await api.getPartyUrn(salesforceCustomer);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(salesforceCustomer);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Invalid APIM customer response has been received');

    expect(result).toBe('');
  });

  it.each(falselyUrnResponses)('should return an empty string party URN if getOrCreatePartyDbInfo returns an invalid party urn - %s', async (response) => {
    // Arrange
    getOrCreatePartyDbInfo.mockResolvedValue(response);

    // Act
    const result = await api.getPartyUrn(salesforceCustomer);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith(salesforceCustomer);
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Invalid party URN has been received');

    expect(result).toBe('');
  });
});
