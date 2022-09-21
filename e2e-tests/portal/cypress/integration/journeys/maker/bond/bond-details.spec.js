const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');
const BOND_FORM_VALUES = require('./bond-form-values');
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

context('Bond Details', () => {
  let deal;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MOCK_DEAL, BANK1_MAKER1)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  describe('after submitting one form field and navigating back to `Bond Details` page', () => {
    it('should display validation errors for all required fields', () => {
      cy.loginGoToDealPage(BANK1_MAKER1, deal);

      pages.contract.addBondButton().click();

      cy.title().should('eq', `Bond Details${pages.defaults.pageTitleAppend}`);

      pages.bondDetails.bondIssuerInput().type(BOND_FORM_VALUES.DETAILS.bondIssuer);
      pages.bondDetails.submit().click();

      cy.url().should('include', '/financial-details');
      partials.taskListHeader.itemLink('bond-details').click();

      const TOTAL_REQUIRED_FORM_FIELDS = 2;

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondDetails.bondTypeInputErrorMessage().should('be.visible');
      pages.bondDetails.facilityStageInputErrorMessage().should('be.visible');
    });
  });

  it('should display the correct title for bond details', () => {
    cy.loginGoToDealPage(BANK1_MAKER1, deal);

    pages.contract.addBondButton().click();

    pages.bondDetails.title().contains('Bond');
  });

  it('form submit with extra characters in coverStart and coverEnd dates must show a validation error', () => {
    cy.loginGoToDealPage(BANK1_MAKER1, deal);

    pages.contract.addBondButton().click();

    pages.bondDetails.bondIssuerInput().type(BOND_FORM_VALUES.DETAILS.bondIssuer);
    pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
    pages.bondDetails.facilityStageIssuedInput().click();
    pages.bondDetails.requestedCoverStartDateDayInput().type(`${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay}-`);
    pages.bondDetails.requestedCoverStartDateMonthInput().type(BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth);
    pages.bondDetails.requestedCoverStartDateYearInput().type(BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear);
    pages.bondDetails.coverEndDateDayInput().type(`${BOND_FORM_VALUES.DETAILS.coverEndDateDay}-`);
    pages.bondDetails.coverEndDateMonthInput().type(BOND_FORM_VALUES.DETAILS.coverEndDateMonth);
    pages.bondDetails.coverEndDateYearInput().type(BOND_FORM_VALUES.DETAILS.coverEndDateYear);
    pages.bondDetails.nameInput().type(BOND_FORM_VALUES.DETAILS.name);
    pages.bondDetails.bondBeneficiaryInput().type(BOND_FORM_VALUES.DETAILS.bondBeneficiary);

    pages.bondDetails.submit().click();

    partials.taskListHeader.itemStatus('bond-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });

    partials.taskListHeader.itemStatus('financial-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });

    partials.taskListHeader.itemStatus('fee-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });

    pages.bondDetails.bondDetails().click();
    pages.bondDetails.requestedCoverStartDateInputErrorMessage().contains('The day for the requested Cover Start Date must include 1 or 2 numbers');
    pages.bondDetails.coverEndDateInputErrorMessage().contains('The day for the cover end date must only include 1 or 2 numbers');

    pages.bondDetails.requestedCoverStartDateDayInput().type('##');
    pages.bondDetails.requestedCoverStartDateMonthInput().type('##');
    pages.bondDetails.requestedCoverStartDateYearInput().type('##');
    pages.bondDetails.coverEndDateDayInput().type('##');
    pages.bondDetails.coverEndDateMonthInput().type('##');
    pages.bondDetails.coverEndDateYearInput().type('##');

    partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
      const bondId = bondIdHiddenInput[0].value;

      pages.bondDetails.saveGoBackButton().click();

      const row = pages.contract.bondTransactionsTable.row(bondId);

      row.requestedCoverStartDate().contains('Invalid date');
      row.coverEndDate().contains('Invalid date');
    });
  });

  it('form submit of all required fields should display a `completed` status tag only for `Bond Details` in task list header', () => {
    cy.loginGoToDealPage(BANK1_MAKER1, deal);

    pages.contract.addBondButton().click();

    fillBondForm.details.facilityStageIssued();

    pages.bondDetails.submit().click();

    partials.taskListHeader.itemStatus('bond-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Completed');
    });

    partials.taskListHeader.itemStatus('financial-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });

    partials.taskListHeader.itemStatus('fee-details').invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });
  });

  describe('When a user selects `unissued` facility stage', () => {
    it('should render additional form fields', () => {
      cy.loginGoToDealPage(BANK1_MAKER1, deal);

      pages.contract.addBondButton().click();
      pages.bondDetails.facilityStageUnissuedInput().click();

      pages.bondDetails.ukefGuaranteeInMonthsInput().should('be.visible');
    });

    describe('after form submit and navigating back to `Bond Details` page', () => {
      it('should display validation errors for required fields and `unissued` required fields', () => {
        cy.loginGoToDealPage(BANK1_MAKER1, deal);

        pages.contract.addBondButton().click();
        pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.facilityStageUnissuedInput().click();

        pages.bondDetails.submit().click();
        cy.url().should('include', '/financial-details');
        partials.taskListHeader.itemLink('bond-details').click();

        const UNISSUED_REQUIRED_FORM_FIELDS = 1;
        const TOTAL_REQUIRED_FORM_FIELDS = UNISSUED_REQUIRED_FORM_FIELDS;

        partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
        pages.bondDetails.ukefGuaranteeInMonthsInputErrorMessage().should('be.visible');
      });
    });

    it('form submit should progess to `Bond Financial Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1, deal);

      pages.contract.addBondButton().click();

      fillBondForm.details.facilityStageUnissued();

      pages.bondDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');
    });

    it('form submit should populate Deal page with `unissued` specific text/values and link to `Bond Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1, deal);

      pages.contract.addBondButton().click();

      // get bondId, go back to deal page
      // assert uniqueNumber text and link
      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        fillBondForm.details.facilityStageUnissued();
        pages.bondDetails.submit().click();

        pages.bondFinancialDetails.saveGoBackButton().click();

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumberLink().invoke('text').then((text) => {
          expect(text.trim()).equal('Bond’s reference number not entered');
        });

        row.facilityStage().invoke('text').then((text) => {
          expect(text.trim()).equal('Unissued');
        });

        // assert that clicking the `unique number` link progesses to the bond page
        row.uniqueNumberLink().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/details');
      });
    });

    it('form submit should prepopulate submitted form fields when returning back to `Bond Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1, deal);

      pages.contract.addBondButton().click();

      pages.bondDetails.facilityStageUnissuedInput().click();
      pages.bondDetails.bondIssuerInput().type(BOND_FORM_VALUES.DETAILS.bondIssuer);
      pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
      pages.bondDetails.ukefGuaranteeInMonthsInput().type(BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
      pages.bondDetails.bondBeneficiaryInput().type(BOND_FORM_VALUES.DETAILS.bondBeneficiary);
      pages.bondDetails.submit().click();

      cy.url().should('include', '/financial-details');
      partials.taskListHeader.itemLink('bond-details').click();
      cy.url().should('include', '/details');

      assertBondFormValues.details.unissued();
    });
  });

  describe('When a user selects `issued` facility stage', () => {
    it('should render additional form fields', () => {
      cy.loginGoToDealPage(BANK1_MAKER1, deal);

      pages.contract.addBondButton().click();

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
        cy.loginGoToDealPage(BANK1_MAKER1, deal);

        pages.contract.addBondButton().click();
        pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.facilityStageIssuedInput().click();

        pages.bondDetails.submit().click();
        cy.url().should('include', '/financial-details');
        partials.taskListHeader.itemLink('bond-details').click();

        const ISSUED_REQUIRED_FORM_FIELDS = 2;
        const TOTAL_REQUIRED_FORM_FIELDS = ISSUED_REQUIRED_FORM_FIELDS;

        partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
        pages.bondDetails.coverEndDateInputErrorMessage().should('be.visible');
        pages.bondDetails.nameInputErrorMessage().should('be.visible');
      });
    });

    it('form submit should progress to `Bond Financial Details` page and prepopulate submitted form fields when returning back to `Bond Details` page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1, deal);

      pages.contract.addBondButton().click();

      fillBondForm.details.facilityStageIssued();
      pages.bondDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');

      partials.taskListHeader.itemLink('bond-details').click();
      cy.url().should('include', '/details');

      assertBondFormValues.details.issued();
    });

    describe('When a user clicks `save and go back` button', () => {
      it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Details` page', () => {
        cy.loginGoToDealPage(BANK1_MAKER1, deal);

        pages.contract.addBondButton().click();

        fillBondForm.details.facilityStageIssued();

        partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
          const bondId = bondIdHiddenInput[0].value;

          pages.bondDetails.saveGoBackButton().click();

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
