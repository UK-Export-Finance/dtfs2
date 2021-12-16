const mapCreateEstore = require('./map-create-estore');
const formatNameForSharepoint = require('../helpers/formatNameForSharepoint');
const CONSTANTS = require('../../constants');

describe('mapCreateEstore', () => {
  const mockBssDeal = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    buyer: {
      name: 'Test',
      country: {
        name: 'Belgium',
      },
    },
    destinationOfGoodsAndServices: {
      name: 'France',
    },
    exporter: {
      companyName: 'Testing',
    },
    ukefDealId: '123456',
    facilities: [
      { ukefFacilityId: '1' },
      { ukefFacilityId: '2' },
    ],
  };

  const mockGefDeal = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
    exporter: {
      companyName: 'Testing',
    },
    ukefDealId: '123456',
    facilities: [
      { ukefFacilityId: '1' },
      { ukefFacilityId: '2' },
    ],
  };

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return mapped object', () => {
      const result = mapCreateEstore(mockBssDeal);

      const expected = {
        exporterName: formatNameForSharepoint(mockBssDeal.exporter.companyName),
        buyerName: formatNameForSharepoint(mockBssDeal.buyer.name),
        dealIdentifier: mockBssDeal.ukefDealId,
        destinationMarket: mockBssDeal.destinationOfGoodsAndServices.name,
        riskMarket: mockBssDeal.buyer.country.name,
        facilityIdentifiers: ['1', '2'],
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return mapped object with some default values', () => {
      const result = mapCreateEstore(mockGefDeal);

      const expected = {
        exporterName: formatNameForSharepoint(mockGefDeal.exporter.companyName),
        buyerName: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        dealIdentifier: mockGefDeal.ukefDealId,
        destinationMarket: 'United Kingdom',
        riskMarket: 'United Kingdom',
        facilityIdentifiers: ['1', '2'],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there is no exporter', () => {
    it('should default exporterName to empty string', () => {
      const mockDeal = {
        ...mockGefDeal,
        exporter: null,
      };
      const result = mapCreateEstore(mockDeal);
      expect(result.exporterName).toEqual('');
    });
  });

  describe('when there is no exporter.companyName', () => {
    it('should default exporterName to empty string', () => {
      const mockDeal = {
        ...mockGefDeal,
        exporter: {
          // companyName: null,
        },
      };

      const result = mapCreateEstore(mockDeal);
      expect(result.exporterName).toEqual('');
    });
  });
});
