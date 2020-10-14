const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

const goToBondFeeDetailsPage = (deal) => {
  cy.loginGoToDealPage(MAKER_LOGIN, deal);

  pages.contract.addBondButton().click();
  partials.bondProgressNav.progressNavLinkBondFeeDetails().click();
  cy.url().should('include', '/fee-details');
};

context('Bond Fee Details', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('when submitting an empty form and navigating back to `Bond Fee Details` page', () => {
    it('should display validation errors for all required fields', () => {
      goToBondFeeDetailsPage(deal);
      cy.title().should('eq', `Bond Fee Details${pages.defaults.pageTitleAppend}`);

      pages.bondFeeDetails.submit().click();

      cy.url().should('include', '/check-your-answers');
      partials.bondProgressNav.progressNavLinkBondFeeDetails().click();

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
      partials.bondProgressNav.progressNavLinkBondFeeDetails().click();

      const TOTAL_REQUIRED_FORM_FIELDS = 2;

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondFeeDetails.feeFrequencyInputErrorMessage().should('be.visible');
      pages.bondFeeDetails.dayCountBasisInputErrorMessage().should('be.visible');
    });
  });

  it('form submit of all required fields should display a checked `Bond Fee Details` checkbox in progress nav', () => {
    cy.loginGoToDealPage(MAKER_LOGIN, deal);

    pages.contract.addBondButton().click();
    partials.bondProgressNav.progressNavLinkBondFeeDetails().click();

    fillBondForm.feeDetails();

    pages.bondFeeDetails.submit().click();

    partials.bondProgressNav.progressNavBondFeeDetailsCompletedCheckbox().should('be.visible');
    partials.bondProgressNav.progressNavBondFeeDetailsCompletedCheckbox().should('be.checked');

    partials.bondProgressNav.progressNavBondDetailsCompletedCheckbox().should('not.be.visible');
    partials.bondProgressNav.progressNavBondFinancialDetailsCompletedCheckbox().should('not.be.visible');
  });

  it('form submit should progress to the `Bond Preview` page and prepopulate submitted form fields when returning back to `Bond Fee Details` page', () => {
    goToBondFeeDetailsPage(deal);

    fillBondForm.feeDetails();
    pages.bondFeeDetails.submit().click();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/bond/');
    cy.url().should('include', '/check-your-answers');

    partials.bondProgressNav.progressNavLinkBondFeeDetails().click();
    cy.url().should('include', '/fee-details');

    assertBondFormValues.feeDetails();
  });

  describe('when a user selects that the Fee Type is `At maturity`', () => {
    it('should NOT render `Fee frequency` radio buttons', () => {
      goToBondFeeDetailsPage(deal);

      pages.bondFeeDetails.feeTypeAtMaturityInput().click();

      const mainContent = cy.get('#main-content');
      const visibleRadioButtons = mainContent.find('input[type=radio]:visible');
      visibleRadioButtons.should('have.length', 5);
    });
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Fee Details` page', () => {
      goToBondFeeDetailsPage(deal);

      fillBondForm.feeDetails();

      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondFeeDetails.saveGoBackButton().click();

        cy.url().should('not.include', '/fee-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumberLink().click();
        partials.bondProgressNav.progressNavLinkBondFeeDetails().click();
        cy.url().should('include', '/fee-details');

        assertBondFormValues.feeDetails();
      });
    });
  });
});
