const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { isCountryUk } = require('@ukef/dtfs2-common');
const { addPartyUrns, identifyDealParties } = require('./deal.party-db');
const { MOCK_GEF_MAPPED_DEAL } = require('../__mocks__/mock-deal');
const { getOrCreatePartyDbInfo, updateDeal } = require('../api');
const { MOCK_PORTAL_USERS } = require('../__mocks__/mock-portal-users');

jest.mock('../../../src/v1/api', () => ({
  ...jest.requireActual('../../../src/v1/api'),
  getOrCreatePartyDbInfo: jest.fn(),
  updateDeal: jest.fn(),
}));

const {
  companiesHouseRegistrationNumber: companyRegNo,
  companyName,
  probabilityOfDefault,
  selectedIndustry: { code },
} = MOCK_GEF_MAPPED_DEAL.exporter;

describe('addPartyUrns', () => {
  const auditDetails = generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id);

  const invalidDeal = [null, undefined, '', {}];

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each(invalidDeal)('should return false when `%s` is supplied as a deal parameter', async (deal) => {
    // Act
    const noDeal = await addPartyUrns(deal, auditDetails);

    // Assert
    expect(noDeal).toEqual(false);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Adding party URN, invalid deal supplied');
  });

  it('should return empty party URN and not invoke the API call when an empty companies house number is supplied', async () => {
    // Arrange
    const deal = {
      ...MOCK_GEF_MAPPED_DEAL,
      exporter: {
        ...MOCK_GEF_MAPPED_DEAL.exporter,
        companiesHouseRegistrationNumber: '',
      },
    };
    const mockReturn = {
      ...MOCK_GEF_MAPPED_DEAL,
      tfm: {
        ...MOCK_GEF_MAPPED_DEAL.tfm,
        parties: {
          exporter: {
            partyUrn: '',
            partyUrnRequired: true,
          },
          buyer: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          indemnifier: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          agent: {
            partyUrn: '',
            partyUrnRequired: false,
          },
        },
      },
    };

    jest.mocked(updateDeal).mockResolvedValue(mockReturn);

    // Act
    const response = await addPartyUrns(deal, auditDetails);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
    expect(updateDeal).toHaveBeenCalledTimes(1);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('An invalid company house registration number has been supplied');

    expect(response.tfm.parties.exporter.partyUrn).toBe('');
  });

  it('should return empty party URN and not invoke the API call when an empty companies name is supplied', async () => {
    // Arrange
    const deal = {
      ...MOCK_GEF_MAPPED_DEAL,
      exporter: {
        ...MOCK_GEF_MAPPED_DEAL.exporter,
        companyName: '',
      },
    };
    const mockReturn = {
      ...MOCK_GEF_MAPPED_DEAL,
      tfm: {
        ...MOCK_GEF_MAPPED_DEAL.tfm,
        parties: {
          exporter: {
            partyUrn: '',
            partyUrnRequired: true,
          },
          buyer: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          indemnifier: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          agent: {
            partyUrn: '',
            partyUrnRequired: false,
          },
        },
      },
    };

    jest.mocked(updateDeal).mockResolvedValue(mockReturn);

    // Act
    const response = await addPartyUrns(deal, auditDetails);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
    expect(updateDeal).toHaveBeenCalledTimes(1);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('An invalid company name has been supplied');

    expect(response.tfm.parties.exporter.partyUrn).toBe('');
  });

  it('should return empty party URN and not invoke the API call when an empty PoD is supplied', async () => {
    // Arrange
    const deal = {
      ...MOCK_GEF_MAPPED_DEAL,
      exporter: {
        ...MOCK_GEF_MAPPED_DEAL.exporter,
        probabilityOfDefault: '',
      },
    };
    const mockReturn = {
      ...MOCK_GEF_MAPPED_DEAL,
      tfm: {
        ...MOCK_GEF_MAPPED_DEAL.tfm,
        parties: {
          exporter: {
            partyUrn: '',
            partyUrnRequired: true,
          },
          buyer: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          indemnifier: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          agent: {
            partyUrn: '',
            partyUrnRequired: false,
          },
        },
      },
    };

    jest.mocked(updateDeal).mockResolvedValue(mockReturn);

    // Act
    const response = await addPartyUrns(deal, auditDetails);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
    expect(updateDeal).toHaveBeenCalledTimes(1);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('An invalid probability of default has been supplied');

    expect(response.tfm.parties.exporter.partyUrn).toBe('');
  });

  it('should return empty party URN and not invoke the API call when an empty industry code is supplied', async () => {
    // Arrange
    const deal = {
      ...MOCK_GEF_MAPPED_DEAL,
      exporter: {
        ...MOCK_GEF_MAPPED_DEAL.exporter,
        selectedIndustry: {},
      },
    };
    const mockReturn = {
      ...MOCK_GEF_MAPPED_DEAL,
      tfm: {
        ...MOCK_GEF_MAPPED_DEAL.tfm,
        parties: {
          exporter: {
            partyUrn: '',
            partyUrnRequired: true,
          },
          buyer: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          indemnifier: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          agent: {
            partyUrn: '',
            partyUrnRequired: false,
          },
        },
      },
    };

    jest.mocked(updateDeal).mockResolvedValue(mockReturn);

    // Act
    const response = await addPartyUrns(deal, auditDetails);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(0);
    expect(updateDeal).toHaveBeenCalledTimes(1);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('An invalid industry code has been supplied');

    expect(response.tfm.parties.exporter.partyUrn).toBe('');
  });

  it('should return empty party URN when an invalid companies house number is supplied', async () => {
    // Arrange
    const isUkEntity = true;
    const deal = {
      ...MOCK_GEF_MAPPED_DEAL,
      exporter: {
        ...MOCK_GEF_MAPPED_DEAL.exporter,
        companiesHouseRegistrationNumber: 'invalid',
      },
    };
    const mockReturn = {
      ...MOCK_GEF_MAPPED_DEAL,
      tfm: {
        ...MOCK_GEF_MAPPED_DEAL.tfm,
        parties: {
          exporter: {
            partyUrn: '',
            partyUrnRequired: true,
          },
          buyer: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          indemnifier: {
            partyUrn: '',
            partyUrnRequired: false,
          },
          agent: {
            partyUrn: '',
            partyUrnRequired: false,
          },
        },
      },
    };

    jest.mocked(getOrCreatePartyDbInfo).mockResolvedValueOnce({ data: 'Invalid company registration number' });
    jest.mocked(updateDeal).mockResolvedValue(mockReturn);

    // Act
    const response = await addPartyUrns(deal, auditDetails);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);
    expect(updateDeal).toHaveBeenCalledTimes(1);

    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith({ companyRegNo: 'invalid', companyName, probabilityOfDefault, isUkEntity, code });

    expect(response.tfm.parties.exporter.partyUrn).toBe('');
  });

  it('should identify parties are mandatory or not', async () => {
    // Arrange
    const deal = {
      ...MOCK_GEF_MAPPED_DEAL,
      exporter: {
        ...MOCK_GEF_MAPPED_DEAL.exporter,
        companiesHouseRegistrationNumber: 'invalid',
      },
      buyer: {
        name: 'Test buyer',
      },
      indemnifier: {
        name: 'Test indemnifier',
      },
    };

    const { hasExporter, hasBuyer, hasIndemnifier, hasAgent } = identifyDealParties(deal);

    const mockReturn = {
      ...MOCK_GEF_MAPPED_DEAL,
      tfm: {
        ...MOCK_GEF_MAPPED_DEAL.tfm,
        parties: {
          exporter: {
            partyUrn: '',
            partyUrnRequired: hasExporter,
          },
          buyer: {
            partyUrn: '',
            partyUrnRequired: hasBuyer,
          },
          indemnifier: {
            partyUrn: '',
            partyUrnRequired: hasIndemnifier,
          },
          agent: {
            partyUrn: '',
            partyUrnRequired: hasAgent,
          },
        },
      },
    };

    jest.mocked(getOrCreatePartyDbInfo).mockResolvedValueOnce({ data: 'Invalid company registration number' });
    jest.mocked(updateDeal).mockResolvedValue(mockReturn);

    // Act
    const response = await addPartyUrns(deal, auditDetails);

    // Assert
    expect(response.tfm.parties.exporter.partyUrnRequired).toBe(true);
    expect(response.tfm.parties.buyer.partyUrnRequired).toBe(true);
    expect(response.tfm.parties.indemnifier.partyUrnRequired).toBe(true);
    expect(response.tfm.parties.agent.partyUrnRequired).toBe(false);
  });

  it('should return party urn when a complete exporter payload is supplied', async () => {
    // Arrange

    const partyUrn = '00328682';

    const deal = {
      ...MOCK_GEF_MAPPED_DEAL,
      exporter: {
        ...MOCK_GEF_MAPPED_DEAL.exporter,
      },
    };

    const isUkEntity = isCountryUk(deal.exporter.registeredAddress.country);

    const { hasExporter, hasBuyer, hasIndemnifier, hasAgent } = identifyDealParties(deal);

    const mockReturn = {
      ...MOCK_GEF_MAPPED_DEAL,
      tfm: {
        ...MOCK_GEF_MAPPED_DEAL.tfm,
        parties: {
          exporter: {
            partyUrn,
            partyUrnRequired: hasExporter,
          },
          buyer: {
            partyUrn: '',
            partyUrnRequired: hasBuyer,
          },
          indemnifier: {
            partyUrn: '',
            partyUrnRequired: hasIndemnifier,
          },
          agent: {
            partyUrn: '',
            partyUrnRequired: hasAgent,
          },
        },
      },
    };

    jest.mocked(getOrCreatePartyDbInfo).mockResolvedValueOnce([
      {
        partyUrn,
        name: 'Test Ltd',
        sfId: '001S900000zcI',
        companyRegNo: 'SC467044',
        type: null,
        subtype: null,
        isLegacyRecord: false,
      },
    ]);
    jest.mocked(updateDeal).mockResolvedValue(mockReturn);

    // Act
    const response = await addPartyUrns(deal, auditDetails);

    // Assert
    expect(getOrCreatePartyDbInfo).toHaveBeenCalledTimes(1);
    expect(updateDeal).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(0);

    expect(getOrCreatePartyDbInfo).toHaveBeenCalledWith({ companyRegNo, companyName, probabilityOfDefault, isUkEntity, code });

    expect(response.tfm.parties.exporter.partyUrn).toBe('00328682');

    expect(response.tfm.parties.exporter.partyUrnRequired).toBe(true);
    expect(response.tfm.parties.buyer.partyUrnRequired).toBe(false);
    expect(response.tfm.parties.indemnifier.partyUrnRequired).toBe(false);
    expect(response.tfm.parties.agent.partyUrnRequired).toBe(false);
  });
});
