const pages = require('../../pages');
const partials = require('../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');
const BOND_FORM_VALUES = require('./bond-form-values');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

context('Bond Details', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssDeal({});
  });

  describe('after submitting one form field and navigating back to `Bond Details` page', () => {
    it('should display validation errors for all required fields', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();

      cy.title().should('eq', `Bond Details${pages.defaults.pageTitleAppend}`);

      cy.keyboardInput(pages.bondDetails.bondIssuerInput(), BOND_FORM_VALUES.DETAILS.bondIssuer);
      cy.clickSubmitButton();

      cy.url().should('include', '/financial-details');
      partials.taskListHeader.itemLink('bond-details').click();

      const TOTAL_REQUIRED_FORM_FIELDS = 2;

      partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondDetails.bondTypeInputErrorMessage().should('be.visible');
      pages.bondDetails.facilityStageInputErrorMessage().should('be.visible');
    });
  });

  it('should display the correct title for bond details', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    cy.clickAddBondButton();

    pages.bondDetails.title().contains('Bond');
  });

  it('form submit with extra characters in coverStart and coverEnd dates must show a validation error', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    cy.clickAddBondButton();

    cy.keyboardInput(pages.bondDetails.bondIssuerInput(), BOND_FORM_VALUES.DETAILS.bondIssuer);
    pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
    pages.bondDetails.facilityStageIssuedInput().click();

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateDayInput(), `${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay}-`);

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateMonthInput(), BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth);

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateYearInput(), BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear);

    cy.keyboardInput(pages.bondDetails.coverEndDateDayInput(), `${BOND_FORM_VALUES.DETAILS.coverEndDateDay}-`);

    cy.keyboardInput(pages.bondDetails.coverEndDateMonthInput(), BOND_FORM_VALUES.DETAILS.coverEndDateMonth);

    cy.keyboardInput(pages.bondDetails.coverEndDateYearInput(), BOND_FORM_VALUES.DETAILS.coverEndDateYear);

    cy.keyboardInput(pages.bondDetails.nameInput(), BOND_FORM_VALUES.DETAILS.name);

    cy.keyboardInput(pages.bondDetails.bondBeneficiaryInput(), BOND_FORM_VALUES.DETAILS.bondBeneficiary);

    cy.clickSubmitButton();

    cy.assertText(partials.taskListHeader.itemStatus('bond-details'), 'Incomplete');
    cy.assertText(partials.taskListHeader.itemStatus('financial-details'), 'Incomplete');
    cy.assertText(partials.taskListHeader.itemStatus('fee-details'), 'Incomplete');

    pages.bondDetails.bondDetails().click();
    pages.bondDetails.requestedCoverStartDateInputErrorMessage().contains('The day for the requested Cover Start Date must include 1 or 2 numbers');
    pages.bondDetails.coverEndDateInputErrorMessage().contains('The day for the cover end date must only include 1 or 2 numbers');

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateDayInput().clear(), BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay);

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateMonthInput().clear(), `${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth}-`);

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateYearInput().clear(), BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear);

    cy.keyboardInput(pages.bondDetails.coverEndDateDayInput().clear(), BOND_FORM_VALUES.DETAILS.coverEndDateDay);

    cy.keyboardInput(pages.bondDetails.coverEndDateMonthInput().clear(), `${BOND_FORM_VALUES.DETAILS.coverEndDateMonth}-`);

    cy.keyboardInput(pages.bondDetails.coverEndDateYearInput().clear(), BOND_FORM_VALUES.DETAILS.coverEndDateYear);

    cy.clickSubmitButton();

    pages.bondDetails.bondDetails().click();
    pages.bondDetails.requestedCoverStartDateInputErrorMessage().contains('The month for the requested Cover Start Date must include 1 or 2 numbers');
    pages.bondDetails.coverEndDateInputErrorMessage().contains('The month for the cover end date must only include 1 or 2 numbers');

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateDayInput().clear(), BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay);

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateMonthInput().clear(), BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth);

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateYearInput().clear(), `${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear}-`);

    cy.keyboardInput(pages.bondDetails.coverEndDateDayInput().clear(), BOND_FORM_VALUES.DETAILS.coverEndDateDay);

    cy.keyboardInput(pages.bondDetails.coverEndDateMonthInput().clear(), BOND_FORM_VALUES.DETAILS.coverEndDateMonth);

    cy.keyboardInput(pages.bondDetails.coverEndDateYearInput().clear(), `${BOND_FORM_VALUES.DETAILS.coverEndDateYear}-`);

    cy.clickSubmitButton();

    pages.bondDetails.bondDetails().click();
    pages.bondDetails.requestedCoverStartDateInputErrorMessage().contains('The year for the requested Cover Start Date must include 4 numbers');
    pages.bondDetails.coverEndDateInputErrorMessage().contains('The year for the Cover End Date must include 4 numbers');

    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateDayInput().clear(), '##');
    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateMonthInput().clear(), '##');
    cy.keyboardInput(pages.bondDetails.requestedCoverStartDateYearInput().clear(), '##');
    cy.keyboardInput(pages.bondDetails.coverEndDateDayInput().clear(), '##');
    cy.keyboardInput(pages.bondDetails.coverEndDateMonthInput().clear(), '##');
    cy.keyboardInput(pages.bondDetails.coverEndDateYearInput().clear(), '##');

    partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
      const bondId = bondIdHiddenInput[0].value;

      cy.clickSaveGoBackButton();

      const row = pages.contract.bondTransactionsTable.row(bondId);

      row.requestedCoverStartDate().contains('Invalid date');
      row.coverEndDate().contains('Invalid date');
    });
  });

  it('form submit of all required fields should display a `completed` status tag only for `Bond Details` in task list header', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    cy.clickAddBondButton();

    fillBondForm.details.facilityStageIssued();

    cy.clickSubmitButton();

    cy.assertText(partials.taskListHeader.itemStatus('bond-details'), 'Completed');
    cy.assertText(partials.taskListHeader.itemStatus('financial-details'), 'Incomplete');
    cy.assertText(partials.taskListHeader.itemStatus('fee-details'), 'Incomplete');
  });

  describe('When a user selects `unissued` facility stage', () => {
    it('should render additional form fields', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();
      pages.bondDetails.facilityStageUnissuedInput().click();

      pages.bondDetails.ukefGuaranteeInMonthsInput().should('be.visible');
    });

    describe('after form submit and navigating back to `Bond Details` page', () => {
      it('should display validation errors for required fields and `unissued` required fields', () => {
        cy.loginGoToDealPage(BANK1_MAKER1);

        cy.clickAddBondButton();
        pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.facilityStageUnissuedInput().click();

        cy.clickSubmitButton();
        cy.url().should('include', '/financial-details');
        partials.taskListHeader.itemLink('bond-details').click();

        const UNISSUED_REQUIRED_FORM_FIELDS = 1;
        const TOTAL_REQUIRED_FORM_FIELDS = UNISSUED_REQUIRED_FORM_FIELDS;

        partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
        pages.bondDetails.ukefGuaranteeInMonthsInputErrorMessage().should('be.visible');
      });
    });

    it('form submit should progess to `Bond Financial Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();

      fillBondForm.details.facilityStageUnissued();

      cy.clickSubmitButton();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');
    });

    it('form submit should populate Deal page with `unissued` specific text/values and link to `Bond Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();

      // get bondId, go back to deal page
      // assert uniqueNumber text and link
      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        fillBondForm.details.facilityStageUnissued();
        cy.clickSubmitButton();

        cy.clickSaveGoBackButton();

        const row = pages.contract.bondTransactionsTable.row(bondId);

        cy.assertText(row.uniqueNumberLink(), 'Bond’s reference number not entered');

        cy.assertText(row.facilityStage(), 'Unissued');

        // assert that clicking the `unique number` link progesses to the bond page
        row.uniqueNumberLink().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/details');
      });
    });

    it('form submit should prepopulate submitted form fields when returning back to `Bond Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();

      pages.bondDetails.facilityStageUnissuedInput().click();
      cy.keyboardInput(pages.bondDetails.bondIssuerInput(), BOND_FORM_VALUES.DETAILS.bondIssuer);
      pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
      cy.keyboardInput(pages.bondDetails.ukefGuaranteeInMonthsInput(), BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
      cy.keyboardInput(pages.bondDetails.bondBeneficiaryInput(), BOND_FORM_VALUES.DETAILS.bondBeneficiary);
      cy.clickSubmitButton();

      cy.url().should('include', '/financial-details');
      partials.taskListHeader.itemLink('bond-details').click();
      cy.url().should('include', '/details');

      assertBondFormValues.details.unissued();
    });
  });

  describe('When a user selects `issued` facility stage', () => {
    it('should render additional form fields', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();

      pages.bondDetails.facilityStageIssuedInput().click();

      pages.bondDetails.requestedCoverStartDateDayInput().should('be.visible');
      pages.bondDetails.requestedCoverStartDateMonthInput().should('be.visible');
      pages.bondDetails.requestedCoverStartDateYearInput().should('be.visible');
      pages.bondDetails.coverEndDateDayInput().should('be.visible');
      pages.bondDetails.coverEndDateMonthInput().should('be.visible');
      pages.bondDetails.coverEndDateYearInput().should('be.visible');
      pages.bondDetails.nameInput().should('be.visible');
    });

    describe('after form submit and navigating back to `Bond Details` page', () => {
      it('should display validation errors for required fields and `issued` required fields', () => {
        cy.loginGoToDealPage(BANK1_MAKER1);

        cy.clickAddBondButton();
        pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.facilityStageIssuedInput().click();

        cy.clickSubmitButton();
        cy.url().should('include', '/financial-details');
        partials.taskListHeader.itemLink('bond-details').click();

        const ISSUED_REQUIRED_FORM_FIELDS = 2;
        const TOTAL_REQUIRED_FORM_FIELDS = ISSUED_REQUIRED_FORM_FIELDS;

        partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
        pages.bondDetails.coverEndDateInputErrorMessage().should('be.visible');
        pages.bondDetails.nameInputErrorMessage().should('be.visible');
      });
    });

    it('form submit should progress to `Bond Financial Details` page and prepopulate submitted form fields when returning back to `Bond Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);

      cy.clickAddBondButton();

      fillBondForm.details.facilityStageIssued();
      cy.clickSubmitButton();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');

      partials.taskListHeader.itemLink('bond-details').click();
      cy.url().should('include', '/details');

      assertBondFormValues.details.issued();
    });

    describe('When a user clicks `save and go back` button', () => {
      it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Details` page', () => {
        cy.loginGoToDealPage(BANK1_MAKER1);

        cy.clickAddBondButton();

        fillBondForm.details.facilityStageIssued();

        partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
          const bondId = bondIdHiddenInput[0].value;

          cy.clickSaveGoBackButton();

          cy.url().should('not.include', '/details');
          cy.url().should('include', '/contract');

          const row = pages.contract.bondTransactionsTable.row(bondId);

          row.uniqueNumberLink().click();
          cy.url().should('include', '/bond/');
          cy.url().should('include', '/details');

          assertBondFormValues.details.issued();
        });
      });
    });
  });
});
