import { ReasonForCancellingErrorsViewModel } from '../../../../types/view-models';
import { validateReasonForCancelling } from './validate-reason-for-cancelling';

describe('validateReasonForCancelling', () => {
  const errorFreeReasons = [
    {
      description: 'undefined',
      reason: undefined,
    },
    {
      description: 'an empty string',
      reason: '',
    },
    {
      description: 'a 1200 characters',
      reason: new Array(1201).join('x'),
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

  it('returns an error when the reason is 1201 characters', () => {
    // Arrange
    const reason = new Array(1202).join('x');

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
