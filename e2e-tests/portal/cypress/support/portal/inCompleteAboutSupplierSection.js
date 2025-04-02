const { contract, contractAboutSupplier } = require('../../e2e/pages');
/**
 * Completes the about supplier and about buyer sections for a BSS/EWCS deal.
 *
 *
 */
const inCompleteAboutSupplierSection = () => {
  contract.aboutSupplierDetailsLink().click();
  contractAboutSupplier.nextPage().click();
};

export { inCompleteAboutSupplierSection };
