const pages = require('../../pages');
const partials = require('../../partials');
const dealFullyCompleted = require('./fixtures/dealFullyCompleted');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

context('New BSS deal: Check deal details page', () => {
  let deal;
  beforeEach(() => {
    cy.insertOneDeal(dealFullyCompleted, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });
  it('should render the mandatory criteria checklist when a new deal is created', () => {
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/contract/${deal._id}/submission-details`));
    pages.contractSubmissionDetails.mandatoryCriteriaBox().should('exist');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="1"]').should('contain', 'Bank with a duly completed Supplier Declaration');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="2"]').should('contain', 'The Bank has complied with its policies and procedures');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="3"]').should('contain', 'the Supplier has provided the Bank with a duly completed UK Supplier Declaration');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="7"]').should('contain', 'The Bank is the sole and beneficial owner');
  });

  it('should render the mandatory criteria checklist when a deal is cloned', () => {
    cy.loginGoToDealPage(BANK1_MAKER1, deal);
    pages.contract.cloneDealLink().contains('Clone');
    pages.contract.cloneDealLink().invoke('attr', 'aria-label').then((label) => {
      expect(label).to.equal(`Clone Deal ${deal.bankInternalRefName}`);
    });
    pages.contract.cloneDealLink().click();
    cy.url().should('include', '/clone/before-you-start');

    pages.beforeYouStart.true().click();
    pages.beforeYouStart.submit().click();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/clone');
    pages.cloneDeal.cloneTransactionsInput().click();

    pages.cloneDeal.submit().click();

    cy.url().should('include', '/dashboard/');

    // confirm success message is displayed
    partials.successMessage.successMessage().should('be.visible');
    partials.successMessage.successMessageListItem().contains('cloned successfully');

    // click link to cloned deal
    partials.successMessage.successMessageLink().click();
    cy.url().should('include', '/contract/');

    pages.contract.checkDealDetailsTab().click();
    pages.contractSubmissionDetails.mandatoryCriteriaBox().should('exist');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="1"]').should('contain', 'Bank with a duly completed Supplier Declaration');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="2"]').should('contain', 'The Bank has complied with its policies and procedures');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="3"]').should('contain', 'the Supplier has provided the Bank with a duly completed UK Supplier Declaration');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="10"]').should('contain', 'The Bank is not restricted or prevented by any agreement');
  });
});
