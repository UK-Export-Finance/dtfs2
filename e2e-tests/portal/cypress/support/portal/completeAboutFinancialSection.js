const { fillFinancialDetails } = require('./createBssEwcsDeal');
/**
 * Completes the final section of a form.
 *
 * @description Calls the `fillFinancialDetails` function to populate the section with financial details.
 */
const completeAboutFinancialSection = () => {
  fillFinancialDetails();
};

export { completeAboutFinancialSection };
