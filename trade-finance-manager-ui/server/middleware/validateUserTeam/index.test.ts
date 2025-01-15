import httpMocks from 'node-mocks-http';
import { TeamId, TEAM_IDS } from '@ukef/dtfs2-common';
import { validateUserTeam } from '.';

describe('validateUserTeam', () => {
  const getHttpMocks = (opts?: { user: { teams: TeamId[] } }) =>
    httpMocks.createMocks({
      session: {
        user: opts?.user || undefined,
        userToken: 'user-token',
      },
    });

  it('should throw an error if user does not exist on the session', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    // Act/Assert
    expect(() => validateUserTeam([])(req, res, next)).toThrow(Error('Expected session.user to be defined'));
  });

  it('should redirect to the default redirect url (/home) if the user is not in the correct team', () => {
    // Arrange
    const requiredTeamIds = [TEAM_IDS.PDC_RECONCILE];
    const { req, res } = getHttpMocks({ user: { teams: [] } });
    const next = jest.fn();

    // Act
    validateUserTeam(requiredTeamIds)(req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res._getRedirectUrl()).toEqual('/home');
  });

  it('should redirect to the specified redirect url if the user is not in the correct team', () => {
    // Arrange
    const redirectUrl = '/not-found';
    const requiredTeamIds = [TEAM_IDS.PDC_RECONCILE];
    const { req, res } = getHttpMocks({ user: { teams: [] } });
    const next = jest.fn();

    // Act
    validateUserTeam(requiredTeamIds, redirectUrl)(req, res, next);

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(res._getRedirectUrl()).toEqual(redirectUrl);
  });

  it('calls the next function if the user is in the correct team', () => {
    // Arrange
    const requiredTeamIds = [TEAM_IDS.PDC_RECONCILE];
    const { req, res } = getHttpMocks({ user: { teams: requiredTeamIds } });
    const next = jest.fn();

    // Act
    validateUserTeam(requiredTeamIds)(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._getRedirectUrl()).toEqual('');
  });
});
