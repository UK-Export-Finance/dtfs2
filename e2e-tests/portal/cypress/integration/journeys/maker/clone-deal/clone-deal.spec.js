const pages = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');
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
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(fullyCompletedDeal, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = fullyCompletedDeal;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });
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

    it('user can view and edit the cloned bonds', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankSupplyContractIDInput();
      pages.cloneDeal.bankSupplyContractNameInput();
      pages.cloneDeal.cloneTransactionsInput().click();

      pages.cloneDeal.submit().click();

      // click link to cloned deal
      partials.successMessage.successMessageLink().click();
      cy.url().should('include', '/contract/');

      let clonedDealId;
      cy.url().then((url) => {
        clonedDealId = url.substring(url.lastIndexOf('/') + 1);
      });

      pages.contract.bondTransactionsTableRows().each((bondTableRow) => {
        const bondId = bondTableRow.attr('data-cy').split('-')[1];
        const bond = pages.contract.bondTransactionsTable.row(bondId);
        bond.uniqueNumberLink().click();
        cy.url().should('include', '/bond');
        cy.url().should('include', '/details');

        pages.bondDetails.bondIssuerInput().type('test');
        pages.bondDetails.submit().click();
        cy.url().should('include', '/bond');
        cy.url().should('include', '/financial-details');
        cy.visit(`/contract/${clonedDealId}`);
      });
    });

    it('user can view and edit the cloned loans', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankSupplyContractIDInput();
      pages.cloneDeal.bankSupplyContractNameInput();
      pages.cloneDeal.cloneTransactionsInput().click();

      pages.cloneDeal.submit().click();

      // click link to cloned deal
      partials.successMessage.successMessageLink().click();
      cy.url().should('include', '/contract/');

      let clonedDealId;
      cy.url().then((url) => {
        clonedDealId = url.substring(url.lastIndexOf('/') + 1);
      });

      pages.contract.loansTransactionsTableRows().each((loanTableRow) => {
        const loanId = loanTableRow.attr('data-cy').split('-')[1];
        const loan = pages.contract.loansTransactionsTable.row(loanId);
        loan.bankReferenceNumberLink().click();
        cy.url().should('include', '/loan');
        cy.url().should('include', '/guarantee-details');

        pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
        pages.loanGuaranteeDetails.submit().click();
        cy.url().should('include', '/loan');
        cy.url().should('include', '/financial-details');
        cy.visit(`/contract/${clonedDealId}`);
      });
    });

    it('user can delete the cloned bonds and loans', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankSupplyContractIDInput();
      pages.cloneDeal.bankSupplyContractNameInput();
      pages.cloneDeal.cloneTransactionsInput().click();

      pages.cloneDeal.submit().click();

      // click link to cloned deal
      partials.successMessage.successMessageLink().click();
      cy.url().should('include', '/contract/');

      let clonedDealId;
      cy.url().then((url) => {
        clonedDealId = url.substring(url.lastIndexOf('/') + 1);

        // check length of cloned facilities
        pages.contract.bondTransactionsTableRows().should('have.length', 2);
        pages.contract.loansTransactionsTableRows().should('have.length', 2);

        // delete bonds
        pages.contract.bondTransactionsTableRows().each((bondTableRow) => {
          const bondId = bondTableRow.attr('data-cy').split('-')[1];
          const bond = pages.contract.bondTransactionsTable.row(bondId);
          bond.deleteLink().click();
          cy.url().should('eq', relative(`/contract/${clonedDealId}/bond/${bondId}/delete`));
          pages.loanDelete.submit().click();
          cy.visit(`/contract/${clonedDealId}`);
        });

        // delete loans
        pages.contract.loansTransactionsTableRows().each((loanTableRow) => {
          const loanId = loanTableRow.attr('data-cy').split('-')[1];
          const loan = pages.contract.loansTransactionsTable.row(loanId);
          loan.deleteLink().click();
          cy.url().should('eq', relative(`/contract/${clonedDealId}/loan/${loanId}/delete`));
          pages.loanDelete.submit().click();
          cy.visit(`/contract/${clonedDealId}`);
        });

        cy.visit(`/contract/${clonedDealId}`);
        pages.contract.bondTransactionsTableRows().should('have.length', 0);
        pages.contract.loansTransactionsTableRows().should('have.length', 0);
      });
    });
  });
});
