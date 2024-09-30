import { PDC_TEAM_IDS, TEAM_IDS } from '@ukef/dtfs2-common';
import { isPDCReadUser } from './is-pdc-read-user';
import { aTfmSessionUser } from '../../../../test-helpers/test-data/tfm-session-user';

describe('isPDCReadUser', () => {
  describe(`when user is in ${TEAM_IDS.PDC_READ} team`, () => {
    it('should return true', () => {
      const user = {
        ...aTfmSessionUser(),
        teams: [TEAM_IDS.PDC_READ],
      };

      const result = isPDCReadUser(user);

      expect(result).toEqual(true);
    });
  });

  describe(`when user is in ${PDC_TEAM_IDS.PDC_RECONCILE} team`, () => {
    it('should return true', () => {
      const user = {
        ...aTfmSessionUser(),
        teams: [TEAM_IDS.PDC_RECONCILE],
      };

      const result = isPDCReadUser(user);

      expect(result).toEqual(false);
    });
  });
});
