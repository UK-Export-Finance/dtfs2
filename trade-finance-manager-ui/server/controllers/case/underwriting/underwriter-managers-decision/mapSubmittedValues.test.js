import mapSubmittedValues from './mapSubmittedValues';

describe('POST underwriting - map submitted values', () => {
  it('should return object with decision and internalComments', () => {
    const submittedValues = {
      decision: 'Test',
      internalComments: 'mock comments',
    };

    const result = mapSubmittedValues(submittedValues);

    expect(result).toEqual({
      decision: submittedValues.decision,
      internalComments: submittedValues.internalComments,
    });
  });

  describe('when decision is `Approve with conditions` with approveWithConditionsComments', () => {
    it('should return object with comment as approveWithConditionsComments', () => {
      const submittedValues = {
        decision: 'Approve with conditions',
        approveWithConditionsComments: 'approve comments',
      };

      const result = mapSubmittedValues(submittedValues);

      expect(result).toEqual({
        decision: submittedValues.decision,
        comments: submittedValues.approveWithConditionsComments,
      });
    });
  });

  describe('when decision is `Decline` with declineComments', () => {
    it('should return object with comment as declineComments', () => {
      const submittedValues = {
        decision: 'Decline',
        declineComments: 'decline comments',
      };

      const result = mapSubmittedValues(submittedValues);

      expect(result).toEqual({
        decision: submittedValues.decision,
        comments: submittedValues.declineComments,
      });
    });
  });
});
