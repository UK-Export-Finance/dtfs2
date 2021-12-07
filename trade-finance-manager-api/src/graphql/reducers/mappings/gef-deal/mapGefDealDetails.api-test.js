const mapGefDealDetails = require('./mapGefDealDetails');
const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');

describe('mapGefDealDetails', () => {
  const mockDeal = {
    _id: MOCK_GEF_DEAL._id,
    dealSnapshot: {
      ...MOCK_GEF_DEAL,
      facilities: [],
    },
    tfm: {},
  };

  it('should return mapped details', () => {
    const result = mapGefDealDetails(mockDeal.dealSnapshot);

    const expected = {
      ukefDealId: mockDeal.dealSnapshot.ukefDealId,
      bankSupplyContractID: mockDeal.dealSnapshot.bankInternalRefName,
      bankSupplyContractName: mockDeal.dealSnapshot.additionalRefName,
      submissionType: mockDeal.dealSnapshot.submissionType,
      dateOfLastAction: mockDeal.dealSnapshot.updatedAt,
      owningBank: {
        name: mockDeal.dealSnapshot.bank.name,
        emails: mockDeal.dealSnapshot.bank.emails,
        partyUrn: mockDeal.dealSnapshot.bank.partyUrn,
      },
    };

    expect(result).toEqual(expected);
  });
});
