import { DETAILS } from './bond-form-values';

const pages = require('../../pages');
const partials = require('../../partials');
const BOND_FORM_VALUES = require('./bond-form-values');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const MOCK_DEAL = {
  bankInternalRefName: 'someDealId',
  additionalRefName: 'someDealName',
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

context('Add a Bond to a Deal', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal({});
  });

  it('should allow a user to create a Deal, pass Red Line and add a Bond to the deal', () => {
    cy.createADeal({
      username: BANK1_MAKER1.username,
      password: BANK1_MAKER1.password,
      bankDealId: MOCK_DEAL.bankInternalRefName,
      bankDealName: MOCK_DEAL.additionalRefName,
    });

    cy.url().should('include', '/contract/');

    cy.addBondToDeal();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/bond/');
    cy.url().should('include', '/check-your-answers');

    partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
      const bondId = bondIdHiddenInput[0].value;

      cy.clickSaveGoBackButton();

      const bondRow = pages.contract.bondTransactionsTable.row(bondId);
      bondRow.uniqueNumberLink().contains(DETAILS.name);
      bondRow.deleteLink().contains(`Delete ${DETAILS.name}`);
    });
  });

  describe('when a user submits all Bond forms without completing any fields', () => {
    it('should display all validation errors for required fields in `Check your answers` page', () => {
      cy.createADeal({
        username: BANK1_MAKER1.username,
        password: BANK1_MAKER1.password,
        bankDealId: MOCK_DEAL.bankInternalRefName,
        bankDealName: MOCK_DEAL.additionalRefName,
      });
      cy.clickAddBondButton();
      cy.clickSubmitButton();
      cy.clickSubmitButton();

      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;
        cy.clickSubmitButton();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/check-your-answers');
        cy.title().should('eq', `Check your answers - Bond - ${bondId}${pages.defaults.pageTitleAppend}`);
        const TOTAL_REQUIRED_FORM_FIELDS = 8;
        partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
      });
    });
  });

  describe('when a user submits a Bond form without completing any fields', () => {
    it('bond should display `Incomplete` status in Deal page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();

      // get bondId, go back to Deal page
      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        cy.assertText(row.bondStatus(), 'Incomplete');

        cy.assertText(row.uniqueNumberLink(), 'Bond’s reference number not entered');

        cy.assertText(row.deleteLink(), 'Delete bond');
      });
    });

    describe('after viewing the `Bond Preview` page', () => {
      it('should display validation errors in `Bond Details`, `Bond Financial Details` and `Bond Fee Details` pages and a link to `Check your answers` page', () => {
        cy.createADeal({
          username: BANK1_MAKER1.username,
          password: BANK1_MAKER1.password,
          bankDealId: MOCK_DEAL.bankInternalRefName,
          bankDealName: MOCK_DEAL.additionalRefName,
        });
        cy.clickAddBondButton();
        cy.clickSubmitButton();
        cy.clickSubmitButton();
        cy.clickSubmitButton();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/check-your-answers');

        partials.taskListHeader.itemLink('bond-details').click();
        partials.errorSummaryLinks().should('have.length', 2);

        partials.taskListHeader.itemLink('financial-details').click();
        partials.errorSummaryLinks().should('have.length', 4);

        partials.taskListHeader.itemLink('fee-details').click();
        partials.errorSummaryLinks().should('have.length', 2);

        partials.taskListHeader.checkYourAnswersLink().should('be.visible');
        partials.taskListHeader.checkYourAnswersLink().click();

        cy.url().should('include', '/bond/');
        cy.url().should('include', '/check-your-answers');
      });
    });
  });

  describe('When a user submits all required Bond form fields (`issued` facility stage, currency same as Supply Contract Currency)', () => {
    it('should progress to `Bond Preview` page and render submission details', () => {
      cy.createADeal({
        username: BANK1_MAKER1.username,
        password: BANK1_MAKER1.password,
        bankDealId: MOCK_DEAL.bankInternalRefName,
        bankDealName: MOCK_DEAL.additionalRefName,
      });

      cy.addBondToDeal();

      cy.url().should('include', '/check-your-answers');

      pages.bondPreview.submissionDetails().should('be.visible');
    });

    it('should display a `completed` status tag for all Bond forms in task list header and a `check your answers` link', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);
      cy.addBondToDeal();
      cy.url().should('include', '/check-your-answers');

      cy.assertText(partials.taskListHeader.itemStatus('bond-details'), 'Completed');
      cy.assertText(partials.taskListHeader.itemStatus('financial-details'), 'Completed');
      cy.assertText(partials.taskListHeader.itemStatus('fee-details'), 'Completed');

      partials.taskListHeader.checkYourAnswersLink().should('be.visible');

      cy.assertText(partials.taskListHeader.checkYourAnswersLink(), 'Check your answers');
    });

    it('should populate Deal page with the submitted bond, display `Completed` status and link to `Bond Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);
      cy.addBondToDeal();
      cy.url().should('include', '/check-your-answers');

      // get bondId, go back to Deal page
      // assert that some inputted Bond data is displayed in the table
      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        cy.assertText(row.uniqueNumberLink(), BOND_FORM_VALUES.DETAILS.name);

        cy.assertText(row.bondStatus(), 'Completed');

        cy.assertText(row.facilityValue(), `${BOND_FORM_VALUES.FINANCIAL_DETAILS.value}`);

        cy.assertText(row.facilityStage(), 'Issued');

        cy.assertText(
          row.requestedCoverStartDate(),
          `${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay}/${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth}/${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear}`,
        );

        cy.assertText(
          row.coverEndDate(),
          `${BOND_FORM_VALUES.DETAILS.coverEndDateDay}/${BOND_FORM_VALUES.DETAILS.coverEndDateMonth}/${BOND_FORM_VALUES.DETAILS.coverEndDateYear}`,
        );

        // assert that clicking the `unique number` link progresses to the Bond Details page
        row.uniqueNumberLink().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/details');
      });
    });
  });

  describe('When a user clicks `save and go back` button in `Bond Preview` page', () => {
    it('should return to Deal page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);
      cy.addBondToDeal();
      cy.url().should('include', '/check-your-answers');

      cy.clickSaveGoBackButton();

      cy.url().should('not.include', '/check-your-answers');
      cy.url().should('include', '/contract');
      cy.url().should('not.include', '/bond');
    });
  });
});
