import { userFullName } from '../../helpers/user';
import { mapDecisionValue, mapDecisionObject } from './mapDecisionObject.helper';

const CONSTANTS = require('../../constants');

describe('POST underwriting - map decision object', () => {
  describe('mapDecisionValue', () => {
    describe('when value is `Approve without conditions`', () => {
      it('should return mapped value', () => {
        const result = mapDecisionValue(CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS);
        expect(result).toEqual('Approved (with conditions)');
      });
    });

    describe('when value is `Approve without conditions`', () => {
      it('should return mapped value', () => {
        const result = mapDecisionValue(CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITHOUT_CONDITIONS);
        expect(result).toEqual('Approved (without conditions)');
      });
    });

    describe('when value is `Declined`', () => {
      it('should return mapped value', () => {
        const result = mapDecisionValue(CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED);
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
        decision: CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
        internalComments: 'mock comments',
      };

      const result = mapDecisionObject(submittedValues, mockUser);

      expect(result).toEqual({
        decision: mapDecisionValue(submittedValues.decision),
        internalComments: submittedValues.internalComments,
        userFullName: userFullName(mockUser),
      });
    });

    describe('when decision is `Approved with conditions` with approveWithConditionsComments', () => {
      it('should return object with comment as approveWithConditionsComments', () => {
        const submittedValues = {
          decision: CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
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
          decision: CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.DECLINED,
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
