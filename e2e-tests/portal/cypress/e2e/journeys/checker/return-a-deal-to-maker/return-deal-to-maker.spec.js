const { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } = require('@ukef/dtfs2-common');
const { contract, contractReturnToMaker, contractComments } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { ADMIN, BANK1_CHECKER1 } = MOCK_USERS;

context('A checker selects to return a deal to maker from the view-contract page', () => {
  let bssDealId;
  let dealUrl;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      dealUrl = relative(`/contract/${bssDealId}`);
    });
    cy.completeBssEwcsDealFields({ dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, facilityStage: FACILITY_STAGE.UNISSUED });
  });

  it('should cancel and return the user to the view-contract page.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    cy.visit(dealUrl);
    cy.url().should('eq', dealUrl);
    cy.clickReturnToMakerButton();

    // cancel
    contractReturnToMaker.comments().should('have.value', '');
    contractReturnToMaker.cancel().click();

    // check we've gone to the right page
    cy.url().should('eq', dealUrl);
  });

  it('should return an error if no comment has been entered when the Return to Maker button is clicked.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    cy.visit(dealUrl);
    cy.clickReturnToMakerButton();

    // submit without a comment
    cy.clickReturnToMakerButton();

    // expect to stay on the abandon page, and see an error
    cy.url().should('eq', `${dealUrl}/return-to-maker`);
    contractReturnToMaker.expectError('Comment is required when returning a deal to maker.');
  });

  it('should abandon the deal and take the user to /dashboard if a comment has been entered.', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);
    cy.visit(dealUrl);

    contract.commentsTab().click();
    cy.visit(dealUrl);

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
    cy.visit(dealUrl);

    cy.assertText(contract.status(), "Further Maker's input required");

    cy.assertText(contract.previousStatus(), "Ready for Checker's approval");

    // visit the comments page and prove that the comment has been added
    contract.commentsTab().click();

    cy.assertText(contractComments.row(0).comment(), 'to you');

    cy.assertText(contractComments.row(0).commentorName(), `${BANK1_CHECKER1.firstname} ${BANK1_CHECKER1.surname}`);
  });
});
