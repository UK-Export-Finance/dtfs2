const mapEligibilityCriteriaContentStrings = require('./map-eligibility-criteria-content-strings');
const CONSTANTS = require('../../constants');
const CONTENT_STRINGS = require('../content-strings');
const MOCK_BSS_DEAL = require('../__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../__mocks__/mock-gef-deal');

describe('mapEligibilityCriteriaContentStrings', () => {
  const dealTypeBSS = CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS;
  const dealTypeGEF = CONSTANTS.DEALS.DEAL_TYPE.GEF;

  describe(`when dealType is ${dealTypeBSS}`, () => {
    it(`should map eligibility.criteria to ${dealTypeBSS} content strings`, () => {
      const mockCriteria = MOCK_BSS_DEAL.eligibility.criteria;

      const result = mapEligibilityCriteriaContentStrings(
        mockCriteria,
        dealTypeBSS,
      );

      const bssEligibilityCriteriaContentStrings = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[dealTypeBSS];

      const expected = mockCriteria.map((criterion) => {
        const { id } = criterion;

        return {
          ...criterion,
          text: bssEligibilityCriteriaContentStrings[id].text,
          textList: bssEligibilityCriteriaContentStrings[id].textList,
        };
      });

      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${dealTypeGEF}`, () => {
    it(`should map eligibility.criteria to ${dealTypeGEF} content strings`, () => {
      const mockCriteria = MOCK_GEF_DEAL.eligibility.criteria;

      const result = mapEligibilityCriteriaContentStrings(
        mockCriteria,
        dealTypeGEF,
      );

      const gefEligibilityCriteriaContentStrings = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[dealTypeGEF];

      const expected = mockCriteria.map((criterion) => {
        const { id } = criterion;

        return {
          ...criterion,
          text: gefEligibilityCriteriaContentStrings[id].text,
          textList: gefEligibilityCriteriaContentStrings[id].textList,
        };
      });

      expect(result).toEqual(expected);
    });
  });
});
