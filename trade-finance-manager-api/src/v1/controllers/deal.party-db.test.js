const api = require('./deal.party-db');
import { isAutomaticSalesforceCustomerCreationFeatureFlagEnabled } from '@ukef/dtfs2-common';


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
  createParty: jest.fn(),
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
      const { getPartyDbInfo } = require('../api.js');
      getPartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

      const companyData = { companyRegNo: '12345678' };

      const result = await api.getPartyUrn(companyData);

      expect(getPartyDbInfo).toHaveBeenCalledWith(companyData);
      expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

      expect(result).toBe('TEST_URN');
    });


    it('should not call createParty', async () => {
      const { getPartyDbInfo, createParty } = require('../api.js');
      getPartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

      const companyData = { companyRegNo: '12345678' };

      await api.getPartyUrn(companyData);

      expect(createParty).toHaveBeenCalledTimes(0);
    });

    it('should return an empty string if getPartyDbInfo returns false', async () => {
      const { getPartyDbInfo, createParty } = require('../api.js');
      getPartyDbInfo.mockResolvedValue([{ partyUrn: 'TEST_URN' }]);

      const companyData = { companyRegNo: '12345678' };

      await api.getPartyUrn(companyData);

      expect(createParty).toHaveBeenCalledTimes(0);
    });

    it('should return an empty string if getPartyDbInfo returns false', async () => {
      const { getPartyDbInfo } = require('../api.js');
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

  it('should return an empty string if no companyRegNo is provided', async () => {
    const result = await api.getPartyUrn({ companyName: 'name' });
    expect(result).toBe('');
  });

  it('should call getPartyDbInfo for a company that exists, and return urn', async () => {
    const { getPartyDbInfo } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 200, data: [{ partyUrn: 'TEST_URN' }] });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('TEST_URN');
  });

  it('should not call createParty for a company that exists', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 200, data: [{ partyUrn: 'TEST_URN' }] });
    createParty.mockResolvedValue({ status: 200, data: [{ partyUrn: 'TEST_URN' }] });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    await api.getPartyUrn(companyData);

    expect(createParty).toHaveBeenCalledTimes(0);
  });

  it('should call getPartyDbInfo createParty for a company that does not exist, and return urn', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });
    createParty.mockResolvedValue({ status: 200, data: [{ partyUrn: 'TEST_URN' }] });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(createParty).toHaveBeenCalledWith(companyData);
    expect(createParty).toHaveBeenCalledTimes(1);

    expect(result).toBe('TEST_URN');
  });

  it('should return an empty string if the company does not exist but no companyName is provided', async () => {
    const { getPartyDbInfo } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });

    const companyData = { companyRegNo: '12345678', companyName: '' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });

  it('should not call createParty if the company does not exist but no companyName is provided', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });

    const companyData = { companyRegNo: '12345678', companyName: '' };

    await api.getPartyUrn(companyData);

    expect(createParty).toHaveBeenCalledTimes(0);
  });

  it('should handle null partyUrn in creation response gracefully', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });
    createParty.mockResolvedValue({ status: 200, data: [] });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(createParty).toHaveBeenCalledWith(companyData);
    expect(createParty).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });

  it('should handle null data in creation response gracefully', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });
    createParty.mockResolvedValue({ status: 200 });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(createParty).toHaveBeenCalledWith(companyData);
    expect(createParty).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });

  it('should handle null response gracefully', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });
    createParty.mockResolvedValue({});

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(createParty).toHaveBeenCalledWith(companyData);
    expect(createParty).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });
  
});

describe('when automatic Salesforce customer creation feature flag is enabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isAutomaticSalesforceCustomerCreationFeatureFlagEnabled).mockReturnValue(true);
  });

  it('should return an empty string if no companyRegNo is provided', async () => {
    const result = await api.getPartyUrn({ companyName: 'name' });
    expect(result).toBe('');
  });

  it('should call getPartyDbInfo, skip createParty for a company that exists, and return urn', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 200, data: [{ partyUrn: 'TEST_URN' }] });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('TEST_URN');
  });

  it('should not call createParty for a company that exists', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 200, data: [{ partyUrn: 'TEST_URN' }] });
    createParty.mockResolvedValue({ status: 200, data: [{ partyUrn: 'TEST_URN' }] });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    await api.getPartyUrn(companyData);

    expect(createParty).toHaveBeenCalledTimes(0);
  });

  it('should call getPartyDbInfo createParty for a company that does not exist, and return urn', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });
    createParty.mockResolvedValue({ status: 200, data: [{ partyUrn: 'TEST_URN' }] });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(createParty).toHaveBeenCalledWith(companyData);
    expect(createParty).toHaveBeenCalledTimes(1);

    expect(result).toBe('TEST_URN');
  });

  it('should return an empty string if the company does not exist but no companyName is provided', async () => {
    const { getPartyDbInfo } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });

    const companyData = { companyRegNo: '12345678', companyName: '' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });

  it('should not call createParty if the company does not exist but no companyName is provided', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });

    const companyData = { companyRegNo: '12345678', companyName: '' };

    await api.getPartyUrn(companyData);

    expect(createParty).toHaveBeenCalledTimes(0);
  });

  it('should handle null partyUrn in creation response gracefully', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });
    createParty.mockResolvedValue({ status: 200, data: [] });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(createParty).toHaveBeenCalledWith(companyData);
    expect(createParty).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });

  it('should handle null data in creation response gracefully', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });
    createParty.mockResolvedValue({ status: 200 });

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(createParty).toHaveBeenCalledWith(companyData);
    expect(createParty).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });

  it('should handle null response gracefully', async () => {
    const { getPartyDbInfo, createParty } = require('../api.js');
    getPartyDbInfo.mockResolvedValue({ status: 404, data: [{ partyUrn: null }] });
    createParty.mockResolvedValue({});

    const companyData = { companyRegNo: '12345678', companyName: 'name' };

    const result = await api.getPartyUrn(companyData);

    expect(getPartyDbInfo).toHaveBeenCalledWith({ companyRegNo: '12345678' });
    expect(getPartyDbInfo).toHaveBeenCalledTimes(1);

    expect(createParty).toHaveBeenCalledWith(companyData);
    expect(createParty).toHaveBeenCalledTimes(1);

    expect(result).toBe('');
  });
});