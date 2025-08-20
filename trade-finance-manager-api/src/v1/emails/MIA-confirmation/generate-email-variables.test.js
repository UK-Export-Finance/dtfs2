const { PROBABILITY_OF_DEFAULT } = require('@ukef/dtfs2-common');
const { generateMiaConfirmationEmailVars, commonEmailVars } = require('./generate-email-variables');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const bssEmailVariables = require('./bss-email-variables');
const CONSTANTS = require('../../../constants');
const { MOCK_BSS_EWCS_DEAL } = require('../../__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

describe('generate AIN/MIN confirmation email variables', () => {
  const mockFacilityLists = {};

  const deal = {
    dealSnapshot: {
      ...MOCK_BSS_EWCS_DEAL,
    },
    tfm: {
      probabilityOfDefault: PROBABILITY_OF_DEFAULT.DEFAULT_VALUE,
    },
  };

  describe('commonEmailVars', () => {
    it('should return object of email variables used in both BSS and GEF', async () => {
      const mockDeal = await mapSubmittedDeal(deal);

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
    it('should return result of both commonEmailVars and bssEmailVariables functions', async () => {
      const mockDeal = await mapSubmittedDeal(deal);

      const result = generateMiaConfirmationEmailVars(mockDeal, mockFacilityLists);

      const expected = {
        ...commonEmailVars(mockDeal),
        ...bssEmailVariables(mockDeal, mockFacilityLists),
      };
      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return commonEmailVars function', async () => {
      const mockDeal = await mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });

      const result = generateMiaConfirmationEmailVars(mockDeal, mockFacilityLists);

      const expected = commonEmailVars(mockDeal);
      expect(result).toEqual(expected);
    });
  });

  it('should return empty object when dealType is invalid', async () => {
    const mockDeal = await mapSubmittedDeal(deal);
    mockDeal.dealType = 'INVALID';

    const result = generateMiaConfirmationEmailVars(mockDeal);

    expect(result).toEqual({});
  });
});
