import homeController from '.';
import { mockRes } from '../../test-mocks';
import { PDC_TEAM_IDS, TEAM_IDS } from '../../constants';

describe('controllers - home', () => {
  const res = mockRes();

  it("should redirect to login ('/') if the user is not logged in", () => {
    // Arrange
    const mockReq = {
      session: {},
    };

    // Act
    homeController.getUserHomepage(mockReq, res);

    // Assert
    expect(res.redirect).toHaveBeenCalledWith('/');
  });

  const pdcTeams = Object.values(PDC_TEAM_IDS).map((id) => ({
    id,
    redirectLocation: '/utilisation-reports',
  }));
  const nonPdcTeams = Object.values(TEAM_IDS).filter((id) => !id.includes('PDC')).map((id) => ({
    id,
    redirectLocation: '/deals',
  }));
  it.each([...pdcTeams, ...nonPdcTeams])("should redirect to $redirectLocation if the user is in the '$id' team", (team) => {
    // Arrange
    const teams = [team.id];
    const mockReq = {
      session: {
        user: {
          teams,
        },
      },
    };

    // Act
    homeController.getUserHomepage(mockReq, res);

    // Assert
    expect(res.redirect).toHaveBeenCalledWith(team.redirectLocation);
  });
});
