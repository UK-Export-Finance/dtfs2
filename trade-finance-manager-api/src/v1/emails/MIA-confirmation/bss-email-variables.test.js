const { PROBABILITY_OF_DEFAULT } = require('@ukef/dtfs2-common');
const bssEmailVariables = require('./bss-email-variables');
const { generateFacilitiesListString } = require('../../helpers/notify-template-formatters');
const getFacilitiesByType = require('../../helpers/get-facilities-by-type');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const { MOCK_BSS_EWCS_DEAL } = require('../../__mocks__/mock-deal');

describe('generate MIA confirmation email variables - BSS', () => {
  it('should return object', async () => {
    const mockFacilities = [...MOCK_BSS_EWCS_DEAL.bondTransactions.items, ...MOCK_BSS_EWCS_DEAL.loanTransactions.items];

    const mockSubmittedDeal = await mapSubmittedDeal({
      dealSnapshot: {
        ...MOCK_BSS_EWCS_DEAL,
        facilities: mockFacilities,
      },
      tfm: {
        parties: { exporter: {} },
        probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE,
      },
    });

    const result = bssEmailVariables(mockSubmittedDeal);

    const { bonds, loans } = getFacilitiesByType(mockSubmittedDeal.facilities);
    const bssList = generateFacilitiesListString(bonds);
    const ewcsList = generateFacilitiesListString(loans);

    const facilityLists = { bssList, ewcsList };

    const expected = {
      bssList: facilityLists.bssList,
      ewcsList: facilityLists.ewcsList,
    };

    expect(result).toEqual(expected);
  });
});
