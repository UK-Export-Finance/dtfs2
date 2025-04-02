const { contract, contractAboutSupplier } = require('../../e2e/pages');
/**
 * Simulates an incomplete 'About Supplier' section by clicking on the 'About Supplier Details' link and then the 'Next Page' button.
 */
const inCompleteAboutSupplierSection = () => {
  contract.aboutSupplierDetailsLink().click();
  contractAboutSupplier.nextPage().click();
};

export { inCompleteAboutSupplierSection };
