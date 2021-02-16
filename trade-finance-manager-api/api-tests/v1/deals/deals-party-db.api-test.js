const { addPartyUrns } = require('../../../src/v1/controllers/deal.party-db');

describe('add partyUrn to deal', () => {
  it('should return false when no deal passed as parameter', async () => {
    const noDeal = await addPartyUrns();
    expect(noDeal).toEqual(false);
  });

  it('should return false when companies house no not given', async () => {
    const deal = {
      dealSnapshot: {
        submissionDetails: {
          'supplier-companies-house-registration-number': '',
        },
      },
    };
    const noCompaniesHouse = await addPartyUrns(deal);
    expect(noCompaniesHouse.tfm.submissionDetails.supplierPartyUrn).toEqual('');
  });

  it('should return false when companies house no is not matched', async () => {
    const deal = {
      dealSnapshot: {
        submissionDetails: {
          'supplier-companies-house-registration-number': 'NO_MATCH',
        },
      },
    };
    const noMatch = await addPartyUrns(deal);
    expect(noMatch.tfm.submissionDetails.supplierPartyUrn).toEqual('');
  });

  it('should return the deal with partyUrn is successfully matched', async () => {
    const deal = {
      dealSnapshot: {
        submissionDetails: {
          'supplier-companies-house-registration-number': 'MATCH',
        },
      },
    };
    const match = await addPartyUrns(deal);
    expect(match.tfm.submissionDetails.supplierPartyUrn).toEqual('testPartyUrn');
  });

  it('should retain existing tfm data', async () => {
    const deal = {
      dealSnapshot: {
        submissionDetails: {
          'supplier-companies-house-registration-number': 'MATCH',
        },
      },
      tfm: {
        mockField: 'mock data',
      },
    };
    const match = await addPartyUrns(deal);
    expect(match.tfm).toMatchObject(deal.tfm);
  });
});
