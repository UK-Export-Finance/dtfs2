import relative from './relativeURL';
import applicationDetails from './pages/application-details';
import dashboardPage from './pages/dashboard-page';
import companiesHouse from './pages/companies-house';
import automaticCover from './pages/exporters-address';
import aboutExporter from './pages/about-exporter';
import selectExportersCorAddress from './pages/select-exporters-corr-address';

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

    it('completes the exporter section', () => {
      cy.visit(url);
      applicationDetails.exporterDetailsLink().click();
      companiesHouse.regNumberField().type('8989898');
      companiesHouse.continueButton().click();
      automaticCover.noRadioButton().click();
      automaticCover.continueButton().click();
      aboutExporter.microRadioButton().click();
      aboutExporter.probabilityOfDefaultInput().type('10');
      aboutExporter.isFinancingIncreasingRadioYes().click();
      aboutExporter.doneButton().click();
    });

    it('should show add on correspondence address with a dash', () => {
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

      applicationDetails.exporterSummaryListRowKey(0, 3).contains('Correspondence address, if different');
      applicationDetails.exporterSummaryListRowValue(0, 3).contains('—');
      applicationDetails.exporterSummaryListRowAction(0, 3).contains('Add');
      applicationDetails.exporterSummaryListRowAction(0, 3).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/exporters-address`);
      });

      applicationDetails.exporterSummaryListRowKey(0, 4).contains('Industry');
      applicationDetails.exporterSummaryListRowAction(0, 4).should('not.exist');

      // should be - and be add as not yet added
      applicationDetails.exporterSummaryListRowKey(0, 5).contains('SME type');
      applicationDetails.exporterSummaryListRowValue(0, 5).contains('Micro');
      applicationDetails.exporterSummaryListRowAction(0, 5).contains('Change');
      applicationDetails.exporterSummaryListRowAction(0, 5).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
      });

      applicationDetails.exporterSummaryListRowKey(0, 6).contains('Probability of default');
      applicationDetails.exporterSummaryListRowValue(0, 6).contains('10%');
      applicationDetails.exporterSummaryListRowAction(0, 6).contains('Change');
      applicationDetails.exporterSummaryListRowAction(0, 6).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
      });

      applicationDetails.exporterSummaryListRowKey(0, 7).contains('Is finance for this exporter increasing?');
      applicationDetails.exporterSummaryListRowValue(0, 7).contains('Yes');
      applicationDetails.exporterSummaryListRowAction(0, 7).contains('Change');
      applicationDetails.exporterSummaryListRowAction(0, 7).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/about-exporter?status=change`);
      });
    });

    it('add a correspondence address', () => {
      cy.visit(url);

      applicationDetails.exporterSummaryListRowAction(0, 3).find('.govuk-link').click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/exporters-address`));

      automaticCover.yesRadioButton().click();
      automaticCover.correspondenceAddress().type('SW1A 2AA');
      automaticCover.continueButton().click();

      selectExportersCorAddress.selectAddress().select('0');
      selectExportersCorAddress.continueButton().click();

      automaticCover.saveAndReturn().click();
    });

    it('link for correspondence address should be changed and redirect to correspondence address page', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));

      applicationDetails.exporterSummaryListRowKey(0, 3).contains('Correspondence address, if different');
      applicationDetails.exporterSummaryListRowValue(0, 3).should('not.contain', '—');
      applicationDetails.exporterSummaryListRowValue(0, 3).contains('SW1A 2AA');
      applicationDetails.exporterSummaryListRowValue(0, 3).contains('United Kingdom');
      applicationDetails.exporterSummaryListRowAction(0, 3).contains('Change');
      applicationDetails.exporterSummaryListRowAction(0, 3).find('.govuk-link').invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/enter-exporters-correspondence-address?status=change`);
      });
    });
  });
});
