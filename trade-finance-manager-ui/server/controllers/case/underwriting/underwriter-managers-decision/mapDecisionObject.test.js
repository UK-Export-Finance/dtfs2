import mapDecisionObject from './mapDecisionObject';
import userHelpers from '../../../../helpers/user';

const { userFullName } = userHelpers;

describe('POST underwriting - map decision object', () => {
  const mockUser = {
    firstName: 'Hello',
    lastName: 'World',
  };

  it('should return object with decision and internalComments', () => {
    const submittedValues = {
      decision: 'Test',
      internalComments: 'mock comments',
    };

    const result = mapDecisionObject(submittedValues, mockUser);

    expect(result).toEqual({
      decision: submittedValues.decision,
      internalComments: submittedValues.internalComments,
      userFullName: userFullName(mockUser),
    });
  });

  describe('when decision is `Approve with conditions` with approveWithConditionsComments', () => {
    it('should return object with comment as approveWithConditionsComments', () => {
      const submittedValues = {
        decision: 'Approve with conditions',
        approveWithConditionsComments: 'approve comments',
      };

      const result = mapDecisionObject(submittedValues, mockUser);

      expect(result).toEqual({
        decision: submittedValues.decision,
        comments: submittedValues.approveWithConditionsComments,
        userFullName: userFullName(mockUser),
      });
    });
  });

  describe('when decision is `Decline` with declineComments', () => {
    it('should return object with comment as declineComments', () => {
      const submittedValues = {
        decision: 'Decline',
        declineComments: 'decline comments',
      };

      const result = mapDecisionObject(submittedValues, mockUser);

      expect(result).toEqual({
        decision: submittedValues.decision,
        comments: submittedValues.declineComments,
        userFullName: userFullName(mockUser),
      });
    });
  });
});
