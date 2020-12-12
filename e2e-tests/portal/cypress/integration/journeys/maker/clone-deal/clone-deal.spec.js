const pages = require('../../../pages');
const partials = require('../../../partials');
const fullyCompletedDeal = require('../fixtures/dealFullyCompleted');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const goToCloneDealPage = (deal) => {
  cy.loginGoToDealPage(MAKER_LOGIN, deal);
  pages.contract.cloneDealLink().click();
  cy.url().should('include', '/clone/before-you-start');

  pages.beforeYouStart.true().click();
  pages.beforeYouStart.submit().click();

  cy.url().should('include', '/contract');
  cy.url().should('include', '/clone');
};

const TOTAL_FORM_FIELDS = 3;

context('Clone a deal', () => {
  let deal;
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(fullyCompletedDeal, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('When a user creates a deal and clicks `clone deal`', () => {
    it('should progress to the clone page with inputs prepopulated', () => {
      goToCloneDealPage(deal);

      cy.title().should('eq', `Clone Deal - Copy of ${deal.details.bankSupplyContractName}${pages.defaults.pageTitleAppend}`);
      pages.cloneDeal.bankSupplyContractIDInput().should('have.value', deal.details.bankSupplyContractID);
      pages.cloneDeal.bankSupplyContractNameInput().should('have.value', `Copy of ${deal.details.bankSupplyContractName}`);
    });
  });

  describe('When an empty form is submitted', () => {
    it('should display validation errors', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankSupplyContractIDInput().clear();
      pages.cloneDeal.bankSupplyContractNameInput().clear();

      pages.cloneDeal.submit().click();

      cy.url().should('include', '/clone');

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_FORM_FIELDS);
    });
  });

  describe('When a user clones a deal', () => {
    it('should progress to the dashboard page, display a success message, render correct cloned id/name and statuses for each facility', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankSupplyContractIDInput().type('-cloned');
      pages.cloneDeal.bankSupplyContractNameInput().type('-cloned');
      pages.cloneDeal.cloneTransactionsInput().click();

      pages.cloneDeal.submit().click();

      cy.url().should('include', '/dashboard/');

      // confirm success message is displayed
      partials.successMessage.successMessage().should('be.visible');
      partials.successMessage.successMessageListItem().contains('cloned successfully');

      // click link to cloned deal
      partials.successMessage.successMessageLink().click();
      cy.url().should('include', '/contract/');

      // confirm new supply contract ID
      pages.contract.bankSupplyContractID().invoke('text').then((text) => {
        expect(text.trim()).equal(`${deal.details.bankSupplyContractID}-cloned`);
      });

      // confirm new supply contract name
      pages.contract.bankSupplyContractName().invoke('text').then((text) => {
        expect(text.trim()).equal(`Copy of ${deal.details.bankSupplyContractName}-cloned`);
      });

      // confirm About the Supply Contract is retained
      pages.contract.aboutSupplierDetailsStatus().invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      // confirm Eligibility is now marked as 'Not started'
      pages.contract.eligibilityStatus().invoke('text').then((text) => {
        expect(text.trim()).equal('Not started');
      });

      // confirm bond statuses are 'Incomplete'
      pages.contract.bondTransactionsTableRows().each((bondTableRow) => {
        const bondId = bondTableRow.attr('data-cy').split('-')[1];
        const bond = pages.contract.bondTransactionsTable.row(bondId);
        bond.bondStatus().contains('Incomplete');
      });

      // confirm loan statuses are 'Incomplete'
      pages.contract.loansTransactionsTableRows().each((loanTableRow) => {
        const loanId = loanTableRow.attr('data-cy').split('-')[1];
        const loan = pages.contract.loansTransactionsTable.row(loanId);
        loan.loanStatus().contains('Incomplete');
      });
    });
  });
});
