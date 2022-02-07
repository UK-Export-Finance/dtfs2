const {
  generateMiaConfirmationEmailVars,
  commonEmailVars,
} = require('./generate-email-variables');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const bssEmailVariables = require('./bss-email-variables');
const CONSTANTS = require('../../../constants');
const MOCK_BSS_DEAL = require('../../__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

describe('generate AIN/MIN confirmation email variables', () => {
  const mockFacilityLists = {};

  describe('commonEmailVars', () => {
    it('should return object of email variables used in both BSS and GEF', () => {
      const mockDeal = mapSubmittedDeal({ dealSnapshot: MOCK_BSS_DEAL });

      const result = commonEmailVars(mockDeal);

      const expected = {
        recipientName: `${mockDeal.maker.firstname} ${mockDeal.maker.surname}`,
        exporterName: mockDeal.exporter.companyName,
        bankReferenceNumber: mockDeal.bankInternalRefName,
        ukefDealId: mockDeal.ukefDealId,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    const mockDeal = mapSubmittedDeal({ dealSnapshot: MOCK_BSS_DEAL });

    it('should return result of both commonEmailVars and bssEmailVariables functions', () => {
      const result = generateMiaConfirmationEmailVars(mockDeal, mockFacilityLists);

      const expected = {
        ...commonEmailVars(mockDeal),
        ...bssEmailVariables(mockDeal, mockFacilityLists),
      };
      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    const mockDeal = mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });

    it('should return commonEmailVars function', () => {
      const result = generateMiaConfirmationEmailVars(mockDeal, mockFacilityLists);

      const expected = commonEmailVars(mockDeal);
      expect(result).toEqual(expected);
    });
  });

  it('should return empty object when dealType is invalid', () => {
    const mockDeal = mapSubmittedDeal({ dealSnapshot: MOCK_BSS_DEAL });
    mockDeal.dealType = 'INVALID';

    const result = generateMiaConfirmationEmailVars(mockDeal);

    expect(result).toEqual({});
  });
});
