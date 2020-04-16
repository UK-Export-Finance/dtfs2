const pages = require('../../../pages');
const fillBondForm = require('./fill-bond-forms');

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

  describe('When a user completes the `Bond Details` form', () => {
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

  describe('When a user clicks `unissued` bond stage', () => {
    it('should render additional form fields', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        pages.bondDetails.bondStageUnissuedInput().click();

        pages.bondDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      });
    });
  });

  describe('When a user clicks `issued` bond stage', () => {
    it('should render additional form fields', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        pages.bondDetails.bondStageIssuedInput().click();

        pages.bondDetails.requestedCoverStartDateDayInput().should('be.visible');
        pages.bondDetails.requestedCoverStartDateMonthInput().should('be.visible');
        pages.bondDetails.requestedCoverStartDateYearInput().should('be.visible');
        pages.bondDetails.uniqueIdentificationNumberInput().should('be.visible');
      });
    });
  });
});
