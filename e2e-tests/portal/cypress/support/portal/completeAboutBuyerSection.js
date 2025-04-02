const { contractAboutBuyer } = require('../../e2e/pages');
/**
 * Completes the 'About Buyer' section of the contract.
 *
 * Enters the buyer's details, including name and address, and selects the destination of goods and services.
 *
 * @description This function simulates user input to fill out the 'About Buyer' section of the contract.
 *
 * The function will:
 * - Enter a buyer name.
 * - Set the buyer address to a UK address with sample values.
 * - Select the United Kingdom as the destination of goods and services.
 * - Click the 'Next' button to proceed to the next page.
 */
const completeAboutBuyerSection = () => {
  cy.keyboardInput(contractAboutBuyer.buyerName(), 'Buyer Name');
  contractAboutBuyer.buyerAddress().country().select('United Kingdom');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().line1(), 'Line 1');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().line2(), 'Line 2');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().line3(), 'Line 3');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().town(), 'Town');
  cy.keyboardInput(contractAboutBuyer.buyerAddress().postcode(), 'AB1 2CD');
  contractAboutBuyer.destinationOfGoodsAndServices().select('United Kingdom');
  contractAboutBuyer.nextPage().click();
};

export { completeAboutBuyerSection };
