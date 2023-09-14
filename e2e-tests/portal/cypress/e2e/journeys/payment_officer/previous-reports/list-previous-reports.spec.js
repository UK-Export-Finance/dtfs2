const { previousReports } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relativeURL = require('../../../relativeURL');

// TODO FN-980 update to payment officer role
const { BANK1_MAKER1 } = MOCK_USERS;

context('List previous utilisation reports', () => {
  describe('Selecting 2022 as target year from the side navigation', () => {
    it('Should add a query parameter for targetYear when selected', () => {
      // TODO FN-980 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigation2022Item().click();

      previousReports.currentUrl().should('contain', '?targetYear=2022');
    });

    it('Heading should display target year when selected', () => {
      // TODO FN-980 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigation2022Item().click();

      previousReports.mainHeading().should('contain', '2022');
    });

    it('List items for January and February 2022 displayed', () => {
      // TODO FN-980 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigation2022Item().click();

      previousReports.listItemLinkNovember().should('exist');
      previousReports.listItemLinkDecember().should('exist');
    });
  });

  describe('Selecting 2021 as target year from the side navigation - no reports submitted', () => {
    it('Should add a query parameter for targetYear when selected', () => {
      // TODO FN-980 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigation2021Item().click();

      previousReports.currentUrl().should('contain', '?targetYear=2021');
    });

    it('Body text should display no reports submitted text', () => {
      // TODO FN-980 update to payment officer role
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigation2021Item().click();

      previousReports.bodyText().should('contain', 'No reports have been submitted.');
    });
  });
});
