import { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } from '@ukef/dtfs2-common';

const pages = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('BSS Mandatory criteria: Check deal details page', () => {
  let bssDealId;
  let contractUrl;
  const bankInternalRefName = '9';

  beforeEach(() => {
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
    cy.completeBssEwcsDealFields({ dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, facilityStage: FACILITY_STAGE.UNISSUED });
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });
  it('should render the mandatory criteria checklist when a new deal is created', () => {
    cy.login(BANK1_MAKER1);
    cy.visit(`${contractUrl}/submission-details`);
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
    cy.login(BANK1_MAKER1);
    cy.visit(contractUrl);
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

    // Deal details tab
    pages.contract.checkDealDetailsTab().click();
    pages.contractSubmissionDetails.mandatoryCriteriaBox().should('exist');

    // Assert all BSS/EWCS latest mandatory criteria with HTML stripped out
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
      .find('ol > li[value="4"]')
      .should('contain', 'Where the supplier is not a “Person Within Scope of Windsor Framework”, it is an eligible person OR');

    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="5"]')
      .should('contain', 'Where the supplier is a “Person Within Scope of Windsor Framework”, both it and its parent obligor (if any) is an eligible person.');

    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="6"]')
      .should(
        'contain',
        'The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one-year probability of default of less than 14.1%.',
      );

    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="7"]')
      .should('contain', 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.');

    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="8"]')
      .should('contain', 'The Bank is the sole and beneficial owner of, and has legal title to, the Transaction.');

    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="9"]')
      .should(
        'contain',
        'The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction.',
      );

    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="10"]')
      .should(
        'contain',
        'The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person.',
      );

    pages.contractSubmissionDetails
      .mandatoryCriteriaBox()
      .find('ol > li[value="11"]')
      .should(
        'contain',
        'The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction.',
      );
  });
});
