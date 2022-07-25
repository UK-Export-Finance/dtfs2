const bssEmailVariables = require('./bss-email-variables');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const CONSTANTS = require('../../../constants');
const MOCK_BSS_DEAL = require('../../__mocks__/mock-deal');

describe('generate AIN/MIN confirmation email variables - BSS', () => {
  let mockFacilityLists = {
    issued: 'test',
    unissued: 'test',
  };

  it('should return object', async () => {
    const mockSubmittedDeal = await mapSubmittedDeal({ dealSnapshot: MOCK_BSS_DEAL });

    const result = bssEmailVariables(mockSubmittedDeal, mockFacilityLists);

    const expected = {
      firstname: mockSubmittedDeal.maker.firstname,
      surname: mockSubmittedDeal.maker.surname,
      exporterName: mockSubmittedDeal.exporter.companyName,
      name: mockSubmittedDeal.name,
      ukefDealId: mockSubmittedDeal.ukefDealId,
      isAin: 'yes',
      isMin: 'no',
      issuedFacilitiesList: mockFacilityLists.issued,
      showIssuedHeader: 'yes',
      unissuedFacilitiesList: mockFacilityLists.unissued,
      showUnissuedHeader: 'yes',
    };

    expect(result).toEqual(expected);
  });

  describe('when deal is MIN', () => {
    it('should return correct isAin/isMin properties', async () => {
      const mockSubmittedDeal = {
        ...await mapSubmittedDeal({ dealSnapshot: MOCK_BSS_DEAL }),
        submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      };

      const result = bssEmailVariables(mockSubmittedDeal, mockFacilityLists);

      expect(result.isAin).toEqual('no');
      expect(result.isMin).toEqual('yes');
    });
  });

  describe('when there are no issued or unissued facilities', () => {
    it('should return correct `show issued/unissued header` properties', async () => {
      mockFacilityLists = {
        issued: '',
        unissued: '',
      };

      const mockSubmittedDeal = await mapSubmittedDeal({ dealSnapshot: MOCK_BSS_DEAL });

      const result = bssEmailVariables(mockSubmittedDeal, mockFacilityLists);

      expect(result.showIssuedHeader).toEqual('no');
      expect(result.showUnissuedHeader).toEqual('no');
    });
  });
});
