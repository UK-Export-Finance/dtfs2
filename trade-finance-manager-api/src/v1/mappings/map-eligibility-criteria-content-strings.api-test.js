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
      const mockEligibility = MOCK_BSS_DEAL.eligibility;

      const result = mapEligibilityCriteriaContentStrings(
        mockEligibility,
        dealTypeBSS,
      );

      const eligibilityVersion = mockEligibility.version;
      const contentStrings = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[dealTypeBSS][eligibilityVersion];

      const expected = mockEligibility.criteria.map((criterion) => {
        const { id } = criterion;

        return {
          ...criterion,
          text: contentStrings[id].text,
          textList: contentStrings[id].textList,
        };
      });

      expect(result).toEqual(expected);
    });
  });

  describe(`when dealType is ${dealTypeGEF}`, () => {
    it(`should map eligibility.criteria to ${dealTypeGEF} content strings`, () => {
      const mockEligibility = MOCK_GEF_DEAL.eligibility;

      const result = mapEligibilityCriteriaContentStrings(
        mockEligibility,
        dealTypeGEF,
      );

      const eligibilityVersion = mockEligibility.version;
      const contentStrings = CONTENT_STRINGS.DEAL.ELIGIBILITY_CRITERIA[dealTypeGEF][eligibilityVersion];

      const expected = mockEligibility.criteria.map((criterion) => {
        const { id } = criterion;

        return {
          ...criterion,
          text: contentStrings[id].text,
          textList: contentStrings[id].textList,
        };
      });

      expect(result).toEqual(expected);
    });
  });
});
