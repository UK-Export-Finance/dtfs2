const { createADeal } = require('../../missions');
const { deleteAllDeals } = require('../../missions/deal-api');

const pages = require('../../pages');
const missions = require('../../missions');
// const relative = require('../../relativeURL');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    // TODO rename to bankSupplyContractID and bankSupplyContractName
    bankDealId: 'someDealId',
    bankDealName: 'someDealName',
  },
};

const BOND_DETAILS_FORM_VALUES = {
  bondIssuer: 'mock issuer',
  bondType: {
    value: 'maintenanceBond',
    text: 'Maintenance bond',
  },
  ukefGuaranteeInMonths: '12',
  bondBeneficiary: 'mock beneficiary',
};

context('Add a bond', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    deal = createADeal({
      ...MOCK_DEAL.details,
      ...user,
    });
  });

  describe('When a user clicks `Add a Bond` from the deal page', () => {
    it('should progress to the `Bond Details` page', () => {
      cy.url().should('include', '/contract');

      pages.contract.addBondButton().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/details');
    });
  });

  describe('When a user completes the `Bond Details` form', () => {
    it('should progress to the `Bond Financial Details` page', () => {
      pages.contract.addBondButton().click();
      pages.bondDetails.bondIssuerInput().type(BOND_DETAILS_FORM_VALUES.bondIssuer);
      pages.bondDetails.bondTypeInput().select(BOND_DETAILS_FORM_VALUES.bondType.value);
      pages.bondDetails.bondStageUnissuedInput().click();
      pages.bondDetails.ukefGuaranteeInMonthsInput().type(BOND_DETAILS_FORM_VALUES.ukefGuaranteeInMonths);
      pages.bondDetails.bondBeneficiaryInput().type(BOND_DETAILS_FORM_VALUES.bondBeneficiary);
      // pages.bondDetails.submit();
    });
  });

  // TODO: when selected issued/unissued correct form fields appear

  // describe('When a user completes the `Bond Financial Details` form', () => {
  //   it('should progress to the bond `Fee Details` page', () => {

  //   });
  // });

  // describe('When a user completes the `Bond Fee Details` form', () => {
  //   it('should progress to the `Bond Preview` page', () => {

  //   });
  // });
});
