const { previousReports } = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const relativeURL = require('../../../relativeURL');
const { previousReportDetails } = require('../../../../fixtures/mockUtilisationReportDetails');

const { BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

context('List previous utilisation reports', () => {
  before(() => {
    cy.removeAllUtilisationReports();
    cy.insertUtilisationReports(previousReportDetails);
  });

  after(() => {
    cy.removeAllUtilisationReports();
  });

  describe('On initial page load ', () => {
    const year = '2023';
    it('displays most recent year of reports by default', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.mainHeading().should('contain', year);

      previousReports.sideNavigationItems().first().click();

      previousReports.currentUrl().should('contain', `?targetYear=${year}`);
    });
  });

  describe('Selecting 2022 as target year from the side navigation', () => {
    const year = '2022';

    it('Should add a query parameter for targetYear when selected', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.currentUrl().should('contain', `?targetYear=${year}`);
    });

    it('Heading should display target year when selected', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.mainHeading().should('contain', year);
    });

    it('List items for December 2022 displayed', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.listItemLinkByMonth('December').should('exist');
    });
  });

  describe('Selecting 2021 as target year from the side navigation - no reports submitted', () => {
    const year = '2021';

    it('Should add a query parameter for targetYear when selected', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.currentUrl().should('contain', `?targetYear=${year}`);
    });

    it('Body text should display no reports submitted text', () => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      cy.visit(relativeURL('/previous-reports'));

      previousReports.sideNavigationItemByYear(year).click();

      previousReports.bodyText().should('contain', 'No reports have been submitted.');
    });
  });
});
