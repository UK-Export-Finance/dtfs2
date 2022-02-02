const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');
const MOCK_USERS = require('../../../../fixtures/users');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

const MOCK_DEAL = {
  bankInternalRefName: 'someDealId',
  additionalRefName: 'someDealName',
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

const goToBondFeeDetailsPage = (deal) => {
  cy.loginGoToDealPage(BANK1_MAKER1, deal);

  pages.contract.addBondButton().click();
  partials.taskListHeader.itemLink('fee-details').click();
  cy.url().should('include', '/fee-details');
};

context('Bond Fee Details', () => {
  let deal;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MOCK_DEAL, BANK1_MAKER1)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  describe('when submitting an empty form and navigating back to `Bond Fee Details` page', () => {
    it('should display validation errors for all required fields', () => {
      goToBondFeeDetailsPage(deal);
      cy.title().should('eq', `Bond Fee Details${pages.defaults.pageTitleAppend}`);

      pages.bondFeeDetails.submit().click();

      cy.url().should('include', '/check-your-answers');
      partials.taskListHeader.itemLink('fee-details').click();

      const TOTAL_REQUIRED_FORM_FIELDS = 2;

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondFeeDetails.feeTypeInputErrorMessage().should('be.visible');
      pages.bondFeeDetails.dayCountBasisInputErrorMessage().should('be.visible');
    });
  });

  describe('after submitting one form field and navigating back to `Bond Fee Details` page', () => {
    it('should display validation errors for all required fields (including nested radio group)', () => {
      goToBondFeeDetailsPage(deal);

      pages.bondFeeDetails.feeTypeInAdvanceInput().click();

      pages.bondFeeDetails.submit().click();

      cy.url().should('include', '/check-your-answers');
      partials.taskListHeader.itemLink('fee-details').click();

      const TOTAL_REQUIRED_FORM_FIELDS = 2;

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondFeeDetails.feeFrequencyInputErrorMessage().should('be.visible');
      pages.bondFeeDetails.dayCountBasisInputErrorMessage().should('be.visible');
    });
  });

  it('form submit of all required fields should render a `completed` status tag only for `Bond Fee Details` in task list header', () => {
    cy.loginGoToDealPage(BANK1_MAKER1, deal);

    pages.contract.addBondButton().click();
    partials.taskListHeader.itemLink('fee-details').click();

    fillBondForm.feeDetails();

    pages.bondFeeDetails.submit().click();
    partials.taskListHeader.itemStatus('fee-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Completed');
    });

    partials.taskListHeader.itemStatus('bond-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });

    partials.taskListHeader.itemStatus('financial-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });
  });


  it('form submit should progress to the `Bond Preview` page and prepopulate submitted form fields when returning back to `Bond Fee Details` page', () => {
    goToBondFeeDetailsPage(deal);

    fillBondForm.feeDetails();
    pages.bondFeeDetails.submit().click();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/bond/');
    cy.url().should('include', '/check-your-answers');

    partials.taskListHeader.itemLink('fee-details').click();
    cy.url().should('include', '/fee-details');

    assertBondFormValues.feeDetails();
  });

  describe('when a user selects that the Fee Type is `At maturity`', () => {
    it('should NOT render `Fee frequency` radio buttons', () => {
      goToBondFeeDetailsPage(deal);

      pages.bondFeeDetails.feeTypeAtMaturityInput().click();

      cy.get('.govuk-radios__item:visible').should('have.length', 5);
    });
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Fee Details` page', () => {
      goToBondFeeDetailsPage(deal);

      fillBondForm.feeDetails();

      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondFeeDetails.saveGoBackButton().click();

        cy.url().should('not.include', '/fee-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumberLink().click();
        partials.taskListHeader.itemLink('fee-details').click();
        cy.url().should('include', '/fee-details');

        assertBondFormValues.feeDetails();
      });
    });
  });
});
