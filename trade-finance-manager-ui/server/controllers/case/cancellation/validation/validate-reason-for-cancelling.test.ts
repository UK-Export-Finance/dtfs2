import { MAX_CHARACTER_COUNT } from '@ukef/dtfs2-common';
import { ReasonForCancellingErrorsViewModel } from '../../../../types/view-models';
import { validateReasonForCancelling } from './validate-reason-for-cancelling';

describe('validateReasonForCancelling', () => {
  const errorFreeReasons = [
    {
      description: 'an empty string',
      reason: '',
    },
    {
      description: `${MAX_CHARACTER_COUNT} characters`,
      reason: new Array(Number(MAX_CHARACTER_COUNT) + 1).join('x'),
    },
  ];

  it.each(errorFreeReasons)('returns no errors when the reason is $description', ({ reason }) => {
    // Act
    const result = validateReasonForCancelling(reason);

    // Assert
    const expected: ReasonForCancellingErrorsViewModel = {
      errorSummary: [],
      reasonForCancellingErrorMessage: undefined,
    };
    expect(result).toEqual(expected);
  });

  it(`returns an error when the reason is more that ${MAX_CHARACTER_COUNT} characters`, () => {
    // Arrange
    const reason = new Array(Number(MAX_CHARACTER_COUNT) + 2).join('x');

    // Act
    const result = validateReasonForCancelling(reason);

    // Assert
    const expected: ReasonForCancellingErrorsViewModel = {
      errorSummary: [{ text: 'Reason for cancelling must be 1200 characters or less', href: 'reason-for-cancelling' }],
      reasonForCancellingErrorMessage: 'Reason for cancelling must be 1200 characters or less',
    };
    expect(result).toEqual(expected);
  });
});
