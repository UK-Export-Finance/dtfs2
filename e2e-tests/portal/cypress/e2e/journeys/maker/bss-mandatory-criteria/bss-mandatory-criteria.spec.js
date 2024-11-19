const pages = require('../../../pages');
const partials = require('../../../partials');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { bankInternalRefName } = require('../../../../fixtures/deal');

const { BANK1_MAKER1 } = MOCK_USERS;

context('BSS Mandatory criteria: Check deal details page', () => {
  before(() => {
    cy.createBssEwcsDeal({ readyForCheck: true, dealType: 'AIN', facilityStage: 'Unissued' });
  });

  it('should render the mandatory criteria checklist when a new deal is created', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    pages.contract.checkDealDetailsTab().click();
    pages.contractSubmissionDetails.mandatoryCriteriaBox().should('exist');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="1"]').should('contain', 'Bank with a duly completed Supplier Declaration');
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="2"]')
      .should('contain', 'The Bank has complied with its policies and procedures');
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="3"]')
      .should('contain', 'the Supplier has provided the Bank with a duly completed UK Supplier Declaration');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="7"]').should('contain', 'The Bank is the sole and beneficial owner');
  });

  it('should render the mandatory criteria checklist when a deal is cloned', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    pages.contract.cloneDealLink().contains('Clone');
    pages.contract
      .cloneDealLink()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(`Clone Deal ${bankInternalRefName}`);
      });
    pages.contract.cloneDealLink().click();
    cy.url().should('include', '/clone/before-you-start');

    pages.beforeYouStart.true().click();
    cy.clickSubmitButton();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/clone');
    pages.cloneDeal.cloneTransactionsInput().click();

    cy.clickSubmitButton();

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
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="2"]')
      .should('contain', 'The Bank has complied with its policies and procedures');
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="3"]')
      .should('contain', 'the Supplier has provided the Bank with a duly completed UK Supplier Declaration');
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="10"]')
      .should('contain', 'The Bank is not restricted or prevented by any agreement');
  });
});
