import applicationDetails from './pages/application-details';
import dashboardPage from './pages/dashboard-page';
import companiesHouse from './pages/companies-house';
import automaticCover from './pages/exporters-address';

import CREDENTIALS from '../fixtures/credentials.json';

let url;
let dealId;

context('Incomplete exporter section - application details page', () => {
  describe('Creating application and checking if incomplete exporter sections are showing', () => {
    beforeEach(() => {
      cy.login(CREDENTIALS.MAKER);
    });

    it('creates the application', () => {
      dashboardPage.createNewSubmission().click();
      dashboardPage.gefSubmission().click();
      dashboardPage.continueButton().click();
      dashboardPage.mandatoryCriteriaYes().click();
      dashboardPage.continueButton().click();
      dashboardPage.internalRefName().type('A');
      dashboardPage.continueButton().click();
      cy.url().then((thisUrl) => {
        url = thisUrl;
        // get dealId from last split
        dealId = thisUrl.split('/').slice(-1);
      });
    });

    it('add the exporter', () => {
      cy.visit(url);
      applicationDetails.exporterDetailsLink().click();
      companiesHouse.regNumberField().type('8989898');
      companiesHouse.continueButton().click();
      automaticCover.noRadioButton().click();
      automaticCover.continueButton().click();
      // exits without saving, to ensure does not bug and hide fields
      dashboardPage.dashboardHome().click();
    });

    it('should show add on the fields not completed yet', () => {
      cy.visit(url);
      applicationDetails.exporterSummaryListRowKey(0, 0).contains('Companies House registration number');
      applicationDetails.exporterSummaryListRowAction(0, 0).contains('Change');
      applicationDetails.exporterSummaryListRowAction(0, 0).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/companies-house?status=change`);
      });

      // should not be able to edit these 3 fields as locked by company house data
      applicationDetails.exporterSummaryListRowKey(0, 1).contains('Company name');
      applicationDetails.exporterSummaryListRowAction(0, 1).should('not.exist');

      applicationDetails.exporterSummaryListRowKey(0, 2).contains('Registered Address');
      applicationDetails.exporterSummaryListRowAction(0, 2).should('not.exist');

      applicationDetails.exporterSummaryListRowKey(0, 3).contains('Industry');
      applicationDetails.exporterSummaryListRowAction(0, 3).should('not.exist');

      // should be - and be add as not yet added
      applicationDetails.exporterSummaryListRowKey(0, 4).contains('SME type');
      applicationDetails.exporterSummaryListRowValue(0, 4).contains('—');
      applicationDetails.exporterSummaryListRowAction(0, 4).contains('Add');
      applicationDetails.exporterSummaryListRowAction(0, 4).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
      });

      applicationDetails.exporterSummaryListRowKey(0, 5).contains('Probability of default');
      applicationDetails.exporterSummaryListRowValue(0, 5).contains('—');
      applicationDetails.exporterSummaryListRowAction(0, 5).contains('Add');
      applicationDetails.exporterSummaryListRowAction(0, 5).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
      });

      applicationDetails.exporterSummaryListRowKey(0, 6).contains('Is finance for this exporter increasing?');
      applicationDetails.exporterSummaryListRowValue(0, 6).contains('—');
      applicationDetails.exporterSummaryListRowAction(0, 6).contains('Add');
      applicationDetails.exporterSummaryListRowAction(0, 6).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
      });
    });
  });
});
