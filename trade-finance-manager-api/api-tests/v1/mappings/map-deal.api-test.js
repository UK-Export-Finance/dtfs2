const mapDeal = require('../../../server/v1/mappings/map-deal');
const mapEligibilityCriteriaContentStrings = require('../../../server/v1/mappings/map-eligibility-criteria-content-strings');
const { MOCK_BSS_EWCS_DEAL } = require('../../../server/v1/__mocks__/mock-deal');

const { eligibility, facilities, bondTransactions, loanTransactions } = MOCK_BSS_EWCS_DEAL;

describe('mappings - map-deal', () => {
  const mockBonds = bondTransactions.items.map(({ _id }) => ({ _id }));
  const mockLoans = loanTransactions.items.map(({ _id }) => ({ _id }));

  const allFacilities = bondTransactions.items.concat(loanTransactions.items);

  const mockDeal = {
    dealType: MOCK_BSS_EWCS_DEAL.dealType,
    eligibility,
    facilities,
    bondTransactions: {
      items: mockBonds,
    },
    loanTransactions: {
      items: mockLoans,
    },
  };

  it('should map facilities and update eligibility.criteria from content-strings', async () => {
    const deal = mockDeal;
    const result = await mapDeal(deal);

    const mockDealWithoutBondsAndLoans = deal;
    delete mockDealWithoutBondsAndLoans.bondTransactions;
    delete mockDealWithoutBondsAndLoans.loanTransactions;

    const expected = {
      ...mockDeal,
      eligibility: {
        ...mockDeal.eligibility,
        criteria: mapEligibilityCriteriaContentStrings(mockDeal.eligibility, mockDeal.dealType),
      },
      bondTransactions: {},
      loanTransactions: {},
      facilities: allFacilities.map((f) => ({
        _id: f._id,
        facilitySnapshot: {
          _id: f._id,
        },
      })),
    };

    expect(result).toMatchObject(expected);
  });
});
