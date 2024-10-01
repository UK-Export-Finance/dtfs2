import { PDC_TEAM_IDS, TEAM_IDS } from '@ukef/dtfs2-common';
import { isPDCReconcileUser } from './is-pdc-reconcile-user';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';

describe('isPDCReconcileUser', () => {
  describe(`when user is in ${TEAM_IDS.PDC_READ} team`, () => {
    it('should return false', () => {
      const user = {
        ...aTfmSessionUser(),
        teams: [TEAM_IDS.PDC_READ],
      };

      const result = isPDCReconcileUser(user);

      expect(result).toEqual(false);
    });
  });

  describe(`when user is in ${PDC_TEAM_IDS.PDC_RECONCILE} team`, () => {
    it('should return true', () => {
      const user = {
        ...aTfmSessionUser(),
        teams: [TEAM_IDS.PDC_RECONCILE],
      };

      const result = isPDCReconcileUser(user);

      expect(result).toEqual(true);
    });
  });

  describe(`when user is in ${PDC_TEAM_IDS.PDC_RECONCILE} and ${PDC_TEAM_IDS.PDC_RECONCILE} team`, () => {
    it('should return true', () => {
      const user = {
        ...aTfmSessionUser(),
        teams: [TEAM_IDS.PDC_RECONCILE, TEAM_IDS.PDC_READ],
      };

      const result = isPDCReconcileUser(user);

      expect(result).toEqual(true);
    });
  });
});
