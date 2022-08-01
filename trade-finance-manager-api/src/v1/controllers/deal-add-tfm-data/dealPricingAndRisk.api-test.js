const dealPricingAndRisk = require('./dealPricingAndRisk');
const mapSubmittedDeal = require('../../mappings/map-submitted-deal');
const MOCK_DEAL_AIN = require('../../__mocks__/mock-deal');
const MOCK_DEAL_MIN = require('../../__mocks__/mock-deal-MIN');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');
const DEFAULTS = require('../../defaults');

describe('deal submit - add TFM data - deal pricing and risk', () => {
  it('should return default lossGivenDefault', async () => {
    const deal = await mapSubmittedDeal({ dealSnapshot: MOCK_DEAL_MIN });
    const result = dealPricingAndRisk(deal);

    expect(result.lossGivenDefault).toEqual(DEFAULTS.LOSS_GIVEN_DEFAULT);
  });

  describe('when submisionType is AIN', () => {
    it('should default exporterCreditRating', async () => {
      const deal = await mapSubmittedDeal({ dealSnapshot: MOCK_DEAL_AIN });
      const result = dealPricingAndRisk(deal);

      expect(result.exporterCreditRating).toEqual(DEFAULTS.CREDIT_RATING.AIN);
    });
  });

  describe('when dealType is GEF', () => {
    it('should use probabilityOfDefault from the deal\'s exporter', async () => {
      const deal = await mapSubmittedDeal({ dealSnapshot: MOCK_GEF_DEAL });
      const result = dealPricingAndRisk(deal);

      expect(result.probabilityOfDefault).toEqual(MOCK_GEF_DEAL.exporter.probabilityOfDefault);
    });
  });

  describe('when dealType is BSS/EWCS', () => {
    it('should default probabilityOfDefault', async () => {
      const deal = await mapSubmittedDeal({ dealSnapshot: MOCK_DEAL_AIN });
      const result = dealPricingAndRisk(deal);

      expect(result.probabilityOfDefault).toEqual(DEFAULTS.PROBABILITY_OF_DEFAULT);
    });
  });
});
