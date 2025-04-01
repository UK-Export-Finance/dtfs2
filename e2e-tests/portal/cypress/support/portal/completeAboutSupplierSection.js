const { fillSupplierDetails } = require('./createBssEwcsDeal');
/**
 * Completes the 'About Supplier' section of a form.
 *
 * @param {Object} params - Parameters for completing the section.
 * @param {string} params.exporterCompanyName - The name of the exporting company.
 *
 * @description Calls the `fillSupplierDetails` function to populate the section with supplier details.
 */
const completeAboutSupplierSection = ({ exporterCompanyName }) => {
  fillSupplierDetails(exporterCompanyName);
};

export { completeAboutSupplierSection };
