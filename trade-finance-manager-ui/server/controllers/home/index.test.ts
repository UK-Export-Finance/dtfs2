import httpMocks from 'node-mocks-http';
import * as homeController from '.';
import { PDC_TEAM_IDS, TEAM_IDS } from '../../constants';
import { PdcTeamId, TeamId } from '../../types/team-id';

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

  const pdcTeams: {id: PdcTeamId; redirectLocation: string}[] = Object.values(PDC_TEAM_IDS as PdcTeamId[]).map((id: string) => ({
    id,
    redirectLocation: '/utilisation-reports',
  }));

  const nonPdcTeams = Object.values(TEAM_IDS as TeamId[])
    .filter((id: TeamId) => !Object.values(PDC_TEAM_IDS as PdcTeamId[]).includes(id))
    .map((id: string) => ({
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

  describe.each(Object.values(PDC_TEAM_IDS as PdcTeamId[]))("when the user is in the '%s' team", (pdcTeamId) => {
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
