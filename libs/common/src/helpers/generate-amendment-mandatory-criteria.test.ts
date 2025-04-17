import { generateAmendmentMandatoryCriteria } from './generate-amendment-mandatory-criteria';
import { AmendmentsEligibilityCriterionWithAnswer } from '../types/mongo-db-models/tfm-facilities';

describe('generateMandatoryCriteria', () => {
  it('should return single test criterion', () => {
    // Arrange
    const criteria: AmendmentsEligibilityCriterionWithAnswer[] = [
      {
        id: 1,
        text: 'Criterion 1',
        answer: true,
      },
    ];

    // Act
    const result = generateAmendmentMandatoryCriteria(criteria);

    // Assert
    expect(result).toEqual('Criterion 1\n\n^true\n\n');
  });

  it('should not return test criterion if no answer', () => {
    // Arrange
    const criteria: AmendmentsEligibilityCriterionWithAnswer[] = [
      {
        id: 1,
        text: 'Criterion 1',
        answer: null,
      },
      {
        id: 1,
        text: 'Criterion 2',
        answer: true,
      },
    ];

    // Act
    const result = generateAmendmentMandatoryCriteria(criteria);

    // Assert
    expect(result).toEqual('Criterion 2\n\n^true\n\n');
  });

  it('should return multiple criteria', () => {
    // Arrange
    const criteria: AmendmentsEligibilityCriterionWithAnswer[] = [
      {
        id: 1,
        text: 'Criterion 1',
        answer: true,
      },
      {
        id: 2,
        text: 'Criterion 2',
        answer: true,
      },
      {
        id: 3,
        text: 'Criterion 3',
        answer: true,
      },
    ];

    // Act
    const result = generateAmendmentMandatoryCriteria(criteria);

    // Assert
    expect(result).toEqual('Criterion 1\n\n^true\n\nCriterion 2\n\n^true\n\nCriterion 3\n\n^true\n\n');
  });
});
