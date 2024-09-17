import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common';
import applicationDetails from '../pages/application-details';
import dashboardPage from '../pages/dashboard-page';
import companiesHouse from '../pages/companies-house';
import exportersAddress from '../pages/exporters-address';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

let url;
let dealId;

context('Incomplete exporter section - application details page', () => {
  describe('Creating application and checking if incomplete exporter sections are showing', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);
    });

    it('creates the application', () => {
      dashboardPage.createNewSubmission().click();
      dashboardPage.gefSubmission().click();
      cy.clickContinueButton();
      dashboardPage.mandatoryCriteriaYes().click();
      cy.clickContinueButton();
      cy.keyboardInput(dashboardPage.internalRefName(), 'A');
      cy.clickContinueButton();
      cy.url().then((thisUrl) => {
        url = thisUrl;
        // get dealId from last split
        dealId = thisUrl.split('/').slice(-1);
      });
    });

    it('add the exporter', () => {
      cy.visit(url);
      applicationDetails.exporterDetailsLink().click();
      cy.keyboardInput(companiesHouse.regNumberField(), MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);
      cy.clickContinueButton();
      exportersAddress.noRadioButton().click();
      cy.clickContinueButton();
      // exits without saving, to ensure does not bug and hide fields
      dashboardPage.dashboardHome().click();
    });

    it('should show add on the fields not completed yet', () => {
      cy.visit(url);
      applicationDetails.exporterSummaryListRowKey(0, 0).contains('Companies House registration number');
      applicationDetails.exporterSummaryListRowAction(0, 0).contains('Change');
      applicationDetails
        .exporterSummaryListRowAction(0, 0)
        .find('.govuk-link')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/gef/application-details/${dealId}/companies-house?status=change`);
        });

      // should not be able to edit these 3 fields as locked by company house data
      applicationDetails.exporterSummaryListRowKey(0, 1).contains('Company name');
      applicationDetails.exporterSummaryListRowAction(0, 1).find('.govuk-link').should('have.class', 'govuk-!-display-none');

      applicationDetails.exporterSummaryListRowKey(0, 2).contains('Registered Address');
      applicationDetails.exporterSummaryListRowAction(0, 2).find('.govuk-link').should('have.class', 'govuk-!-display-none');

      applicationDetails.exporterSummaryListRowKey(0, 4).contains('Industry');
      applicationDetails.exporterSummaryListRowAction(0, 4).find('.govuk-link').should('have.class', 'govuk-!-display-none');

      // should be - and be add as not yet added
      applicationDetails.exporterSummaryListRowKey(0, 5).contains('SME type');
      applicationDetails.exporterSummaryListRowValue(0, 5).contains('—');
      applicationDetails.exporterSummaryListRowAction(0, 5).contains('Add');
      applicationDetails
        .exporterSummaryListRowAction(0, 5)
        .find('.govuk-link')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
        });

      applicationDetails.exporterSummaryListRowKey(0, 6).contains('Probability of default');
      applicationDetails.exporterSummaryListRowValue(0, 6).contains('—');
      applicationDetails.exporterSummaryListRowAction(0, 6).contains('Add');
      applicationDetails
        .exporterSummaryListRowAction(0, 6)
        .find('.govuk-link')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
        });

      applicationDetails.exporterSummaryListRowKey(0, 7).contains('Is finance for this exporter increasing?');
      applicationDetails.exporterSummaryListRowValue(0, 7).contains('—');
      applicationDetails.exporterSummaryListRowAction(0, 7).contains('Add');
      applicationDetails
        .exporterSummaryListRowAction(0, 7)
        .find('.govuk-link')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
        });
    });
  });
});
