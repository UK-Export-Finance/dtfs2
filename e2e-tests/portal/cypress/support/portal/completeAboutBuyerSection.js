const { fillBuyerDetails } = require('./createBssEwcsDeal');
/**
 * Completes the 'About Buyer' section of a form.
 *
 * @description Calls the `fillBuyerDetails` function to populate the section with buyer details.
 */
const completeAboutBuyerSection = () => {
  fillBuyerDetails();
};

export { completeAboutBuyerSection };
