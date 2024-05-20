const mapEligibility = require('./mapEligibility');
const MOCK_DEAL = require('../../../__mocks__/mock-deal-AIN-submitted');

describe('mapEligibility', () => {
  it('should return mapped array of object', () => {
    const mockEligibility = MOCK_DEAL.eligibility;

    const result = mapEligibility(mockEligibility);

    const expectedCriterionObj = (obj) => ({
      id: obj.id,
      answer: obj.answer,
      text: obj.description,
      textList: obj.descriptionList,
    });

    const expectedCriteria = mockEligibility.criteria.map((criterion) => expectedCriterionObj(criterion));

    expect(result).toEqual({
      ...mockEligibility,
      criteria: expectedCriteria,
    });
  });
});
