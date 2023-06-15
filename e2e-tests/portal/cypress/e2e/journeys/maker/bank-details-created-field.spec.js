const { bankDetails } = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Bank details - Submit form with inserted element on page', () => {
  it("should not insert created element's data into the deal", () => {
    cy.passRedLine(BANK1_MAKER1);

    // confirm that we're on '/before-you-start/bank-deal'
    cy.url().should('eq', relative('/before-you-start/bank-deal'));

    // complete 'before you start' form fields
    bankDetails.bankDealId().type('TEST1234');
    bankDetails.bankDealName().type('TESTING');
    // insert element into form
    cy.insertElement('before-you-start-form');

    bankDetails.submit().click();

    // get dealId from url
    cy.url().then((url) => {
      const urlSplit = url.split('/');
      const dealId = urlSplit[4];

      // checks that the deal does not contain intruder field
      cy.getDeal(dealId, BANK1_MAKER1).then((updatedDeal) => {
        // ensure the updated deal does not contain additional intruder field
        expect(updatedDeal.intruder).to.be.an('undefined');
      });
    });
  });
});
