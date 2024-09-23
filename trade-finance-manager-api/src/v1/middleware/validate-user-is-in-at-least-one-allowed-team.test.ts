import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { TEAM_IDS, TeamId } from '@ukef/dtfs2-common';
import { validateUserHasAtLeastOneAllowedTeam } from './validate-user-is-in-at-least-one-allowed-team';
import { aTfmSessionUser } from '../../../test-helpers';

describe('validateUserHasAtLeastOneAllowedTeam', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the user is not in one of the teams', () => {
    const userTeams: TeamId[] = [TEAM_IDS.PDC_READ];
    const allowedTeams: TeamId[] = [TEAM_IDS.PIM, TEAM_IDS.RISK_MANAGERS];
    const user = {
      ...aTfmSessionUser(),
      teams: userTeams,
    };

    it('returns 403', () => {
      // Arrange
      const { req, res } = createMocks({ user });
      const next = jest.fn();

      // Act
      const middleware = validateUserHasAtLeastOneAllowedTeam(allowedTeams);
      middleware(req, res, next);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Forbidden);
      expect(res._getData()).toEqual({ success: false, msg: "You don't have access to this page" });
    });

    it('does not call next', () => {
      // Arrange
      const { req, res } = createMocks({ user });
      const next = jest.fn();

      // Act
      const middleware = validateUserHasAtLeastOneAllowedTeam(allowedTeams);
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
    });
  });

  describe('when the user is in one of the teams', () => {
    const userTeams: TeamId[] = [TEAM_IDS.PIM];
    const allowedTeams: TeamId[] = [TEAM_IDS.PIM, TEAM_IDS.RISK_MANAGERS];
    const user = {
      ...aTfmSessionUser(),
      teams: userTeams,
    };

    it('calls next', () => {
      // Arrange
      const { req, res } = createMocks({ user });
      const next = jest.fn();

      // Act
      const middleware = validateUserHasAtLeastOneAllowedTeam(allowedTeams);
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('does not return 403', () => {
      // Arrange
      const { req, res } = createMocks({ user });
      const next = jest.fn();

      // Act
      const middleware = validateUserHasAtLeastOneAllowedTeam(allowedTeams);
      middleware(req, res, next);

      // Assert
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toBe('');
    });
  });
});
