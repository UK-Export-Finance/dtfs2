import { MOCK_COMPANY_REGISTRATION_NUMBERS } from '@ukef/dtfs2-common';

import applicationDetails from '../../e2e/pages/application-details';
import companiesHouse from '../../e2e/pages/companies-house';
import exportersAddress from '../../e2e/pages/exporters-address';
import aboutExporter from '../../e2e/pages/about-exporter';

/**
 * Completes the about exporter section of the application
 */
export const completeAboutExporterSection = () => {
  applicationDetails.exporterDetailsLink().click();

  cy.keyboardInput(companiesHouse.regNumberField(), MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);
  cy.clickContinueButton();

  exportersAddress.noRadioButton().click();
  cy.clickContinueButton();

  aboutExporter.microRadioButton().click();
  cy.keyboardInput(aboutExporter.probabilityOfDefaultInput(), '10');
  aboutExporter.isFinancingIncreasingRadioYes().click();
  aboutExporter.doneButton().click();
};
