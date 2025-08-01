const { contract, contractAboutSupplier } = require('../../e2e/pages');
const { submissionDetails } = require('../../fixtures/deal');
/**
 * Completes the 'About Supplier' section of the contract.
 *
 * @param {object} options - Options for completing the section.
 * @param {string} options.exporterCompanyName - Name of the exporter company (optional).
 *
 * If `exporterCompanyName` is provided, the function will:
 * - Select 'Exporter' as the supplier type.
 * - Enter the exporter company name.
 * - Set the supplier address to the UK with a test address.
 * - Set the correspondence address to be the same as the supplier address.
 * - Select an industry sector and class.
 *
 * If `exporterCompanyName` is not provided, the function will:
 * - Select the supplier type from the submission details.
 * - Enter a Companies House registration number.
 * - Search for the supplier on Companies House.
 * - Set the supplier address to the UK.
 * - Set the correspondence address to be the same as the supplier address.
 *
 * In both cases, the function will:
 * - Select 'Small' as the SME type.
 * - Enter a supply contract description.
 * - Indicate that the supplier is not legally distinct.
 * - Click the 'Next' button to proceed to the next page.
 */
const completeAboutSupplierSection = ({ exporterCompanyName }) => {
  contract.aboutSupplierDetailsLink().click();

  if (exporterCompanyName) {
    contractAboutSupplier.supplierType().select('Exporter');
    cy.keyboardInput(contractAboutSupplier.supplierName(), exporterCompanyName);
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    cy.keyboardInput(contractAboutSupplier.supplierAddress().line1(), 'Test');
    cy.keyboardInput(contractAboutSupplier.supplierPostCode(), 'AB1 2CD');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.industrySector().select('Accommodation and food service activities');
    contractAboutSupplier.industryClass().select('Event catering activities');
  } else {
    contractAboutSupplier.supplierType().select(submissionDetails['supplier-type']);
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), '12345678');
    contractAboutSupplier.supplierSearchCompaniesHouse().click();
    contractAboutSupplier.supplierAddress().country().select('United Kingdom');
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
  }
  contractAboutSupplier.smeTypeSmall().click();
  cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Supply Contract Description');
  contractAboutSupplier.notLegallyDistinct().click();
  contractAboutSupplier.nextPage().click();
};

export { completeAboutSupplierSection };
