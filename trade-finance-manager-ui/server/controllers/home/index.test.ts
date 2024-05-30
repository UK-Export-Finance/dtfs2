import httpMocks from 'node-mocks-http';
import { PDC_TEAM_IDS, NON_PDC_TEAM_IDS, TeamId } from '@ukef/dtfs2-common';
import * as homeController from '.';

describe('controllers - home', () => {
  const getHttpMocksWithTeams = (...teamIds: TeamId[]) =>
    httpMocks.createMocks({
      session: {
        user: {
          teams: teamIds,
        },
      },
    });

  it("should redirect to login ('/') if the user is not logged in", () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({ session: {} });

    // Act
    homeController.getUserHomepage(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual('/');
  });

  const pdcTeams = Object.values(PDC_TEAM_IDS).map((id) => ({
    id,
    redirectLocation: '/utilisation-reports',
  }));

  const nonPdcTeams = Object.values(NON_PDC_TEAM_IDS).map((id) => ({
    id,
    redirectLocation: '/deals',
  }));

  it.each([...pdcTeams, ...nonPdcTeams])("should redirect to $redirectLocation if the user is in the '$id' team", (team) => {
    // Arrange
    const { req, res } = getHttpMocksWithTeams(team.id);

    // Act
    homeController.getUserHomepage(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(team.redirectLocation);
  });

  describe.each(Object.values(PDC_TEAM_IDS))("when the user is in the '%s' team", (pdcTeamId) => {
    it.each(nonPdcTeams)("should redirect to $redirectLocation if the user is also in the '$id' team", (team) => {
      // Arrange
      const { req, res } = getHttpMocksWithTeams(team.id, pdcTeamId);

      // Act
      homeController.getUserHomepage(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(team.redirectLocation);
    });
  });
});
