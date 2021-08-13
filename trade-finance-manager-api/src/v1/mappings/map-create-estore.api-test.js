const mapCreateEstore = require('./map-create-estore');
const formatNameForSharepoint = require('../helpers/formatNameForSharepoint');
const CONSTANTS = require('../../constants');

describe('mapCreateEstore', () => {
  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.GEF}`, () => {
    it('should return mapped object with some default values', () => {
      const mockGefDeal = {
        dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        exporter: {
          companyName: 'Testing',
        },
        ukefDealId: '123456',
        facilities: [
          { ukefFacilityID: '1' },
          { ukefFacilityID: '2' },
        ],
      };

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

  describe(`when dealType is ${CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS}`, () => {
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
        { ukefFacilityID: '1' },
        { ukefFacilityID: '2' },
      ],
    };

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
