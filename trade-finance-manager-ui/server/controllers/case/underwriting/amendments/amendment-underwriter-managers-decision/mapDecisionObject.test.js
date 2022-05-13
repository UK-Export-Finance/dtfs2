import {
  mapDecisionValue,
  mapDecisionObject,
} from './mapDecisionObject';
import {
  userFullName,
} from '../../../../../helpers/user';

describe('POST underwriting - map decision object', () => {
  describe('mapDecisionValue', () => {
    describe('when value is `Approve without conditions`', () => {
      it('should return mapped value', () => {
        const result = mapDecisionValue('Approve with conditions');
        expect(result).toEqual('Approved (with conditions)');
      });
    });

    describe('when value is `Approve without conditions`', () => {
      it('should return mapped value', () => {
        const result = mapDecisionValue('Approve without conditions');
        expect(result).toEqual('Approved (without conditions)');
      });
    });

    describe('when value is `Declined`', () => {
      it('should return mapped value', () => {
        const result = mapDecisionValue('Decline');
        expect(result).toEqual('Declined');
      });
    });

    describe('when value is not recognised', () => {
      it('should return null', () => {
        const result = mapDecisionValue('test');
        expect(result).toEqual(null);
      });
    });
  });

  describe('mapDecisionObject', () => {
    const mockUser = {
      firstName: 'Hello',
      lastName: 'World',
    };

    it('should return object with mapped decision and internalComments', () => {
      const submittedValues = {
        decision: 'Approve with conditions',
        internalComments: 'mock comments',
      };

      const result = mapDecisionObject(submittedValues, mockUser);

      expect(result).toEqual({
        decision: mapDecisionValue(submittedValues.decision),
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
          decision: mapDecisionValue(submittedValues.decision),
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
          decision: mapDecisionValue(submittedValues.decision),
          comments: submittedValues.declineComments,
          userFullName: userFullName(mockUser),
        });
      });
    });
  });
});
