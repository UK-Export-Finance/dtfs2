const generateAinMinConfirmationEmailVars = require('./generate-email-variables');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const gefEmailVariables = require('./gef-email-variables');
const bssEmailVariables = require('./bss-email-variables');
const CONSTANTS = require('../../../constants');
const MOCK_BSS_DEAL = require('../../__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

describe('generate AIN/MIN confirmation email variables', () => {
  const mockFacilityLists = {};

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    const mockDeal = mapSubmittedDeal({ dealSnapshot: MOCK_BSS_DEAL });

    it('should return bssEmailVariables function', () => {
      const result = generateAinMinConfirmationEmailVars(mockDeal, mockFacilityLists);
    
      const expected = bssEmailVariables(mockDeal, mockFacilityLists);
      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    const mockDeal = mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });

    it('should return gefEmailVariables function', () => {
      const result = generateAinMinConfirmationEmailVars(mockDeal, mockFacilityLists);

      const expected = gefEmailVariables(mockDeal, mockFacilityLists);
      expect(result).toEqual(expected);
    });
  });

  it('should return empty object', () => {
    const mockDeal = { dealType: 'INVALID' };
    const result = generateAinMinConfirmationEmailVars(mockDeal);

    expect(result).toEqual({});
  });
});
