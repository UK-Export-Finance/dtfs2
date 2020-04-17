const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');
const BOND_FORM_VALUES = require('./bond-form-values');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Bond details', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user);
  });

  describe('When a user submits the `Bond Details` form', () => {
    it('should progress to the `Bond Financial Details` page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        fillBondForm.details();
        pages.bondDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/financial-details');
      });
    });
  });

  describe('When a user selects `unissued` bond stage', () => {
    it('should render additional form fields', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        pages.bondDetails.bondStageUnissuedInput().click();

        pages.bondDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      });
    });

    it('should render additional submitted form field values in Bond Preview page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        pages.bondDetails.bondStageUnissuedInput().click();

        pages.bondDetails.ukefGuaranteeInMonthsInput().type(BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);

        // go to preview page
        pages.bondDetails.submit().click();
        partials.bondProgressNav.progressNavBondFeeDetails().click();
        pages.bondFeeDetails.submit().click();
        cy.url().should('include', '/preview');

        pages.bondPreview.ukefGuaranteeInMonths().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
        });
      });
    });

    it('should populate Deal page with `unissued` specific text/values and link to bond details page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        // get bondId, go back to deal page
        // assert uniqueNumber text and link
        partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
          const bondId = bondIdHiddenInput[0].value;

          pages.bondDetails.bondStageUnissuedInput().click();
          pages.bondDetails.submit().click();

          pages.bondFinancialDetails.goBackButton().click();

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
    });

    it('should prepopulate submitted form fields when returning back to Bond Details page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        pages.bondDetails.bondStageUnissuedInput().click()
        pages.bondDetails.bondIssuerInput().type(BOND_FORM_VALUES.DETAILS.bondIssuer);
        pages.bondDetails.bondTypeInput().select(BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.ukefGuaranteeInMonthsInput().type(BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
        pages.bondDetails.bondBeneficiaryInput().type(BOND_FORM_VALUES.DETAILS.bondBeneficiary);
        pages.bondDetails.submit().click();

        cy.url().should('include', '/financial-details');
        partials.bondProgressNav.progressNavBondDetails().click();
        cy.url().should('include', '/details');

        pages.bondDetails.bondStageUnissuedInput().should('be.checked');
        pages.bondDetails.bondIssuerInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondIssuer);
        pages.bondDetails.bondTypeInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.ukefGuaranteeInMonthsInput().should('have.value', BOND_FORM_VALUES.DETAILS.ukefGuaranteeInMonths);
        pages.bondDetails.bondBeneficiaryInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondBeneficiary);
      });
    });
  });

  describe('When a user selects `issued` bond stage', () => {
    it('should render additional form fields', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
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
      });
    });

    // TODO USE fill bond form
    it('should prepopulate submitted form fields when returning back to Bond Details page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        fillBondForm.details();
        pages.bondDetails.submit().click();

        cy.url().should('include', '/financial-details');
        partials.bondProgressNav.progressNavBondDetails().click();
        cy.url().should('include', '/details');

        pages.bondDetails.bondIssuerInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondIssuer);
        pages.bondDetails.bondTypeInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondType.value);
        pages.bondDetails.bondStageIssuedInput().should('be.checked');
        pages.bondDetails.requestedCoverStartDateDayInput().should('have.value', BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay);
        pages.bondDetails.requestedCoverStartDateMonthInput().should('have.value', BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth);
        pages.bondDetails.requestedCoverStartDateYearInput().should('have.value', BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear);
        pages.bondDetails.coverEndDateDayInput().should('have.value', BOND_FORM_VALUES.DETAILS.coverEndDateDay);
        pages.bondDetails.coverEndDateMonthInput().should('have.value', BOND_FORM_VALUES.DETAILS.coverEndDateMonth);
        pages.bondDetails.coverEndDateYearInput().should('have.value', BOND_FORM_VALUES.DETAILS.coverEndDateYear);
        pages.bondDetails.uniqueIdentificationNumberInput().should('have.value', BOND_FORM_VALUES.DETAILS.uniqueIdentificationNumber);
        pages.bondDetails.bondBeneficiaryInput().should('have.value', BOND_FORM_VALUES.DETAILS.bondBeneficiary);
      });
    });
  });
});
