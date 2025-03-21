const { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } = require('@ukef/dtfs2-common');
const { contract, contractReturnToMaker, contractComments } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
// const twentyOneDeals = require('../../../../fixtures/deal-dashboard-data');

const { ADMIN, BANK1_CHECKER1 } = MOCK_USERS;

context('A checker selects to return a deal to maker from the view-contract page', () => {
  let bssDealId;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
    cy.completeBssEwcsDealFields({ dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, facilityStage: FACILITY_STAGE.UNISSUED });
  });

  it('The cancel button returns the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    contract.visit(bssDealId);
    cy.clickReturnToMakerButton();

    // cancel
    contractReturnToMaker.comments().should('have.value', '');
    contractReturnToMaker.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', relative(`/contract/${bssDealId}`));
  });

  it('The Return to Maker button generates an error if no comment has been entered.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    contract.visit(bssDealId);
    cy.clickReturnToMakerButton();

    // submit without a comment
    cy.clickReturnToMakerButton();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', relative(`/contract/${bssDealId}/return-to-maker`));
    contractReturnToMaker.expectError('Comment is required when returning a deal to maker.');
  });

  it('If a comment has been entered, the Abandon button Abandons the deal and takes the user to /dashboard', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    contract.visit(bssDealId);

    contract.commentsTab().click();
    contract.visit(bssDealId);

    cy.clickReturnToMakerButton();

    // submit with a comment
    cy.keyboardInput(contractReturnToMaker.comments(), 'to you');
    cy.clickReturnToMakerButton();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    successMessage
      .successMessageListItem()
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.match(/Supply Contract returned to maker./);
      });

    // visit the deal and confirm the updates have been made
    contract.visit(bssDealId);

    cy.assertText(contract.status(), "Further Maker's input required");

    cy.assertText(contract.previousStatus(), "Ready for Checker's approval");

    // visit the comments page and prove that the comment has been added
    contract.commentsTab().click();

    cy.assertText(contractComments.row(0).comment(), 'to you');

    cy.assertText(contractComments.row(0).commentorName(), `${BANK1_CHECKER1.firstname} ${BANK1_CHECKER1.surname}`);
  });
});
