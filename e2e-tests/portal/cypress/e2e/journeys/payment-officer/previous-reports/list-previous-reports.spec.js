const { previousReports } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relativeURL = require('../../../relativeURL');

// TODO FN-955 update to payment officer role
const { BANK1_MAKER1 } = MOCK_USERS;

context('List previous utilisation reports', () => {
  describe('On initial page load ', () => {
    const year = '2023';
    it('displays most recent year of reports by default', () => {
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.mainHeading().should('contain', year);

      previousReports.sideNavigationItems().first().click();

      previousReports.currentUrl().should('contain', `?targetYear=${year}`);
    });
  });

  describe('Selecting 2022 as target year from the side navigation', () => {
    const year = '2022';

    it('Should add a query parameter for targetYear when selected', () => {
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.currentUrl().should('contain', `?targetYear=${year}`);
    });

    it('Heading should display target year when selected', () => {
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.mainHeading().should('contain', year);
    });

    it('List items for January and February 2022 displayed', () => {
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.listItemLinkByMonth('November').should('exist');
      previousReports.listItemLinkByMonth('December').should('exist');
    });
  });

  describe('Selecting 2021 as target year from the side navigation - no reports submitted', () => {
    const year = '2021';

    it('Should add a query parameter for targetYear when selected', () => {
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.currentUrl().should('contain', `?targetYear=${year}`);
    });

    it('Body text should display no reports submitted text', () => {
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.bodyText().should('contain', 'No reports have been submitted.');
    });
  });
});
