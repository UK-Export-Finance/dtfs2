const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');
const BOND_FORM_VALUES = require('./bond-form-values');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Bond Details', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('after submitting one form field and navigating back to `Bond Details` page', () => {
    it('should display validation errors for all required fields', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();

      cy.title().should('eq', `Bond Details${pages.defaults.pageTitleAppend}`);

      pages.bondDetails.bondIssuerInput().type(BOND_FORM_VALUES.DETAILS.bondIssuer);
      pages.bondDetails.submit().click();

      cy.url().should('include', '/financial-details');
      partials.bondProgressNav.progressNavLinkBondDetails().click();

      const TOTAL_REQUIRED_FORM_FIELDS = 2;

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondDetails.bondTypeInputErrorMessage().should('be.visible');
      pages.bondDetails.bondStageInputErrorMessage().should('be.visible');
    });
  });

  it('form submit of all required fields should display a checked checkbox only for `Bond Details` in progress nav', () => {
    cy.loginGoToDealPage(user, deal);

    pages.contract.addBondButton().click();

    fillBondForm.details.bondStageIssued();

    pages.bondDetails.submit().click();

    partials.bondProgressNav.progressNavBondDetailsCompletedCheckbox().should('be.visible');
    partials.bondProgressNav.progressNavBondDetailsCompletedCheckbox().should('be.checked');

    partials.bondProgressNav.progressNavBondFinancialDetailsCompletedCheckbox().should('not.be.visible');
    partials.bondProgressNav.progressNavBondFeeDetailsCompletedCheckbox().should('not.be.visible');
  });

  describe('When a user selects `unissued` bond stage', () => {
    it('should render additional form fields and display `unissued` specific validation errors without submit', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();
      pages.bondDetails.bondStageUnissuedInput().click();

      pages.bondDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      pages.bondDetails.ukefGuaranteeInMonthsInputErrorMessage().should('be.visible');
    });

    describe('after form submit and navigating back to `Bond Details` page', () => {
      it('should display validation errors for required fields and `unissued` required fields', () => {
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();
        pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.bondStageUnissuedInput().click();

        pages.bondDetails.submit().click();
        cy.url().should('include', '/financial-details');
        partials.bondProgressNav.progressNavLinkBondDetails().click();

        const UNISSUED_REQUIRED_FORM_FIELDS = 1;
        const TOTAL_REQUIRED_FORM_FIELDS = UNISSUED_REQUIRED_FORM_FIELDS;

        partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
        pages.bondDetails.ukefGuaranteeInMonthsInputErrorMessage().should('be.visible');
      });
    });

    it('form submit should progess to `Bond Financial Details` page and render additional submitted form field values in `Bond Preview` page', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();

      fillBondForm.details.bondStageUnissued();

      pages.bondDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');

      // progress to preview page
      partials.bondProgressNav.progressNavLinkBondFeeDetails().click();
      pages.bondFeeDetails.submit().click();
      cy.url().should('include', '/preview');

      pages.bondPreview.ukefGuaranteeInMonths().invoke('text').then((text) => {
        expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
      });
    });

    it('form submit should populate Deal page with `unissued` specific text/values and link to `Bond Details` page', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();

      // get bondId, go back to deal page
      // assert uniqueNumber text and link
      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        fillBondForm.details.bondStageUnissued();
        pages.bondDetails.submit().click();

        pages.bondFinancialDetails.saveGoBackButton().click();

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumber().invoke('text').then((text) => {
          expect(text.trim()).equal('Not entered');
        });

        row.bondStage().invoke('text').then((text) => {
          expect(text.trim()).equal('Unissued');
        });

        // assert that clicking the `unique number` link progesses to the bond page
        row.uniqueNumber().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/details');
      });
    });

    it('form submit should prepopulate submitted form fields when returning back to `Bond Details` page', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();

      pages.bondDetails.bondStageUnissuedInput().click();
      pages.bondDetails.bondIssuerInput().type(BOND_FORM_VALUES.DETAILS.bondIssuer);
      pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
      pages.bondDetails.ukefGuaranteeInMonthsInput().type(BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
      pages.bondDetails.bondBeneficiaryInput().type(BOND_FORM_VALUES.DETAILS.bondBeneficiary);
      pages.bondDetails.submit().click();

      cy.url().should('include', '/financial-details');
      partials.bondProgressNav.progressNavLinkBondDetails().click();
      cy.url().should('include', '/details');

      assertBondFormValues.details.unissued();
    });
  });

  describe('When a user selects `issued` bond stage', () => {
    it('should render additional form fields and display `issued` specific validation errors without submit', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();

      pages.bondDetails.bondStageIssuedInput().click();

      pages.bondDetails.requestedCoverStartDateDayInput().should('be.visible');
      pages.bondDetails.requestedCoverStartDateMonthInput().should('be.visible');
      pages.bondDetails.requestedCoverStartDateYearInput().should('be.visible');
      pages.bondDetails.coverEndDateDayInput().should('be.visible');
      pages.bondDetails.coverEndDateMonthInput().should('be.visible');
      pages.bondDetails.coverEndDateYearInput().should('be.visible');
      pages.bondDetails.uniqueIdentificationNumberInput().should('be.visible');

      pages.bondDetails.coverEndDateInputErrorMessage().should('be.visible');
      pages.bondDetails.uniqueIdentificationNumberInputErrorMessage().should('be.visible');
    });

    describe('after form submit and navigating back to `Bond Details` page', () => {
      it('should display validation errors for required fields and `issued` required fields', () => {
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();
        pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.bondStageIssuedInput().click();

        pages.bondDetails.submit().click();
        cy.url().should('include', '/financial-details');
        partials.bondProgressNav.progressNavLinkBondDetails().click();

        const ISSUED_REQUIRED_FORM_FIELDS = 2;
        const TOTAL_REQUIRED_FORM_FIELDS = ISSUED_REQUIRED_FORM_FIELDS;

        partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
        pages.bondDetails.coverEndDateInputErrorMessage().should('be.visible');
        pages.bondDetails.uniqueIdentificationNumberInputErrorMessage().should('be.visible');
      });
    });

    it('form submit should progress to `Bond Financial Details` page and prepopulate submitted form fields when returning back to `Bond Details` page', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();

      fillBondForm.details.bondStageIssued();
      pages.bondDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');

      partials.bondProgressNav.progressNavLinkBondDetails().click();
      cy.url().should('include', '/details');

      assertBondFormValues.details.issued();
    });

    describe('When a user clicks `save and go back` button', () => {
      it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Details` page', () => {
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        fillBondForm.details.bondStageIssued();

        partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
          const bondId = bondIdHiddenInput[0].value;

          pages.bondDetails.saveGoBackButton().click();

          cy.url().should('not.include', '/details');
          cy.url().should('include', '/contract');

          const row = pages.contract.bondTransactionsTable.row(bondId);

          row.uniqueNumber().click();
          cy.url().should('include', '/bond/');
          cy.url().should('include', '/details');

          assertBondFormValues.details.issued();
        });
      });
    });
  });
});
