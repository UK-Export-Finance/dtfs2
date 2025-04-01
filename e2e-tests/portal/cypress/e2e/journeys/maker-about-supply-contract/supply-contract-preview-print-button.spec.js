const { contractAboutPreview } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const aDealWithAboutBuyerComplete = require('./dealWithSecondPageComplete.json');

const { BANK1_MAKER1 } = MOCK_USERS;

context('about-supply-contract preview print button', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(aDealWithAboutBuyerComplete, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  beforeEach(() => {
    cy.login(BANK1_MAKER1);

    contractAboutPreview.visit(deal);
    contractAboutPreview.submissionDetails().should('be.visible');
  });

  it('should render a print button', () => {
    partials.printButton().should('exist');
    cy.assertText(partials.printButton(), 'Print');
  });

  it('should open a print dialogue when pressing the print button', () => {
    cy.assertPrintDialogue(partials.printButton);
  });
});
