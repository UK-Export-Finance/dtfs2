const api = require('../../api');
const generateAinMinConfirmationEmailVars = require('./generate-email-variables');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const gefEmailVariables = require('./gef-email-variables');
const bssEmailVariables = require('./bss-email-variables');
const CONSTANTS = require('../../../constants');
const MOCK_BSS_DEAL = require('../../__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

const getGefMandatoryCriteriaByVersion = jest.fn(() => Promise.resolve([]));
api.getGefMandatoryCriteriaByVersion = getGefMandatoryCriteriaByVersion;

describe('generate AIN/MIN confirmation email variables', () => {
  const mockFacilityLists = {};

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return bssEmailVariables function', async () => {
      const mockDeal = await mapSubmittedDeal({ dealSnapshot: MOCK_BSS_DEAL });

      const result = await generateAinMinConfirmationEmailVars(mockDeal, mockFacilityLists);

      const expected = bssEmailVariables(mockDeal, mockFacilityLists);
      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return gefEmailVariables function', async () => {
      const mockDeal = await mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });

      const result = await generateAinMinConfirmationEmailVars(mockDeal, mockFacilityLists);

      const expected = await gefEmailVariables(mockDeal, mockFacilityLists);
      expect(result).toEqual(expected);
    });
  });

  it('should return empty object when deal type is invalid', async () => {
    const mockDeal = { dealType: 'INVALID' };
    const result = await generateAinMinConfirmationEmailVars(mockDeal);

    expect(result).toEqual({});
  });
});
