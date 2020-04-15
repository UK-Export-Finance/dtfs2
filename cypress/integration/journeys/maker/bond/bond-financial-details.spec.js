const pages = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('./fill-bond-forms');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Bond financial details', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user);
  });

  describe('When a user completes the `Bond Financial Details` form', () => {
    it('should progress to the bond `Fee Details` page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();
        partials.bondProgressNav.progressNavBondFinancialDetails().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/financial-details');

        fillBondForm.financialDetails();
        pages.bondFinancialDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/fee-details');
      });
    });
  });

  // TODO: financial details - when selected yes/no currency, correct form fields appear
  // pages.bondFinancialDetails.currencyInput().select(BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value);
  // pages.bondFinancialDetails.conversionRateInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRate);
  // pages.bondFinancialDetails.conversionRateDateDayInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateDay);
  // pages.bondFinancialDetails.conversionRateDateMonthInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDatMonth);
  // pages.bondFinancialDetails.conversionRateDateYearInput().type(BOND_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateYear);

  // TODO: financial details - disabled inputs guaranteeFeePayableByBank and ukefExposure work as expected
  // functionality needs to be done first - assuming these get automatically populated
});
