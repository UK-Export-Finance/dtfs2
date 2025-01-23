const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { mockUpdateDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const { addPartyUrns } = require('../../../src/v1/controllers/deal.party-db');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const api = require('../../../src/v1/api');
const { MOCK_PORTAL_USERS } = require('../../../src/v1/__mocks__/mock-portal-users');
const { COMPANY_REGISTRATION_NUMBER } = require('../../../src/constants/deals');

describe('add partyUrn to deal', () => {
  beforeEach(() => {
    api.updateDeal.mockReset();
    mockUpdateDeal();
  });

  it('should return false when no deal passed as parameter', async () => {
    mockUpdateDeal();

    const noDeal = await addPartyUrns();
    expect(noDeal).toEqual(false);
  });

  it('should return false when companies house no is not given', async () => {
    mockUpdateDeal();

    const deal = {
      ...MOCK_DEAL,
      exporter: {
        companiesHouseRegistrationNumber: '',
        companyName: 'some name',
      },
    };

    const noCompaniesHouse = await addPartyUrns(deal, generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id));
    expect(noCompaniesHouse.tfm.parties.exporter.partyUrn).toEqual('');
  });

  it('should return false when companies house no is not matched', async () => {
    mockUpdateDeal();

    const deal = {
      ...MOCK_DEAL,
      exporter: {
        companiesHouseRegistrationNumber: COMPANY_REGISTRATION_NUMBER.NO_MATCH,
        companyName: 'some name',
      },
    };

    const noMatch = await addPartyUrns(deal, generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id));
    expect(noMatch.tfm.parties.exporter.partyUrn).toEqual('');
  });

  it('should return the deal with partyUrn is successfully matched', async () => {
    mockUpdateDeal();

    const deal = {
      ...MOCK_DEAL,
      exporter: {
        companiesHouseRegistrationNumber: COMPANY_REGISTRATION_NUMBER.MATCH,
        companyName: 'some name',
      },
    };

    const match = await addPartyUrns(deal, generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id));
    expect(match.tfm.parties.exporter.partyUrn).toEqual('testPartyUrn');
  });

  it('should retain existing tfm data', async () => {
    mockUpdateDeal();

    const deal = {
      ...MOCK_DEAL,
      exporter: {
        companiesHouseRegistrationNumber: COMPANY_REGISTRATION_NUMBER.MATCH,
        companyName: 'some name',
      },
      tfm: {
        mockField: 'mock data',
      },
    };

    const match = await addPartyUrns(deal, generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id));
    expect(match.tfm).toMatchObject(deal.tfm);
  });
});
