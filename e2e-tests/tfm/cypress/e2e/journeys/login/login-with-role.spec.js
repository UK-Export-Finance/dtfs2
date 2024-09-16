import USERS from '../../../fixtures/users';
import { PDC_TEAMS as PDC_TEAMS_OBJECT, TFM_USER_TEAMS } from '../../../fixtures/teams';
import relativeURL from '../../relativeURL';

const findOneUserByTeamId = (teamId) => Object.values(USERS).find((user) => user?.teams?.includes(teamId));

const NON_PDC_TEAMS = Object.values(TFM_USER_TEAMS).filter((team) => !team.includes('PDC'));
const PDC_TEAMS = Object.values(PDC_TEAMS_OBJECT);

context('Login to tfm with specific roles', () => {
  NON_PDC_TEAMS.forEach((teamName) => {
    it(`should redirect to /deals after a login for users in '${teamName}' team`, () => {
      const userInTeam = findOneUserByTeamId(teamName);
      cy.login({ user: userInTeam });

      cy.url().should('eq', relativeURL('/deals/0'));
    });
  });

  PDC_TEAMS.forEach((teamName) => {
    it(`should redirect to /utilisation-reports after a login for users in '${teamName}' team`, () => {
      const userInTeam = findOneUserByTeamId(teamName);

      cy.login({ user: userInTeam });
      cy.url().should('eq', relativeURL('/utilisation-reports'));
    });
  });

  it(`should redirect to /deals/0 after a login for a user with both the '${PDC_TEAMS.PDC_RECONCILE}' and '${TFM_USER_TEAMS.PIM}' teams`, () => {
    const pimPdcReconcileUser = USERS.PIM_PDC_RECONCILE;
    cy.login({ user: pimPdcReconcileUser });

    cy.url().should('eq', relativeURL('/deals/0'));
  });
});
