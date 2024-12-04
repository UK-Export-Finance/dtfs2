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

    pages.contract.checkDealDetailsTab().eq(0).click();
    pages.contractSubmissionDetails.mandatoryCriteriaBox().should('exist');
    pages.contractSubmissionDetails.mandatoryCriteriaBox().find('ol > li[value="1"]').should('contain', 'Bank with a duly completed Supplier Declaration');
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="2"]')
      .should('contain', 'The Bank has complied with its policies and procedures in relation to the Transaction.');
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="3"]')
      .should(
        'contain',
        'Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)',
      );
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="7"]')
      .should('contain', 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.');
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
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="1"]')
      .should(
        'contain',
        'The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate.',
      );
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="2"]')
      .should('contain', 'The Bank has complied with its policies and procedures in relation to the Transaction.');
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="3"]')
      .should(
        'contain',
        'Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)',
      );
    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="10"]')
      .should(
        'contain',
        'The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person.',
      );
  });
});
