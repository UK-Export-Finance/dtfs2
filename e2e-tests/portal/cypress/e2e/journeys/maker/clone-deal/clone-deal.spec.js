const pages = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');
const fullyCompletedDeal = require('../fixtures/dealFullyCompleted');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const goToCloneDealPage = (deal) => {
  cy.loginGoToDealPage(BANK1_MAKER1, deal);
  pages.contract.cloneDealLink().contains('Clone');
  pages.contract
    .cloneDealLink()
    .invoke('attr', 'aria-label')
    .then((label) => {
      expect(label).to.equal(`Clone Deal ${deal.bankInternalRefName}`);
    });
  pages.contract.cloneDealLink().click();
  cy.url().should('include', '/clone/before-you-start');

  pages.beforeYouStart.true().click();
  cy.clickSubmitButton();

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
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(fullyCompletedDeal, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = fullyCompletedDeal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.bonds = bonds;
        dealFacilities.loans = loans;
      });
    });
  });

  after(() => {
    cy.deleteDeals(ADMIN);

    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should display a `bond issuer` hint', () => {
    goToCloneDealPage(deal);

    cy.assertText(pages.cloneDeal.bankInternalRefNameHint(), "It's not possible to change this later.");
  });

  describe('When a user creates a deal and clicks `clone deal`', () => {
    it('should progress to the clone page with inputs prepopulated', () => {
      goToCloneDealPage(deal);

      cy.title().should('eq', `Clone Deal - Copy of ${deal.additionalRefName}${pages.defaults.pageTitleAppend}`);
      pages.cloneDeal.bankInternalRefNameInput().should('have.value', deal.bankInternalRefName);
      pages.cloneDeal.additionalRefNameInput().should('have.value', `Copy of ${deal.additionalRefName}`);
    });
  });

  describe('When an empty form is submitted', () => {
    it('should display validation errors', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankInternalRefNameInput().clear();
      pages.cloneDeal.additionalRefNameInput().clear();

      cy.clickSubmitButton();

      cy.url().should('include', '/clone');

      partials.errorSummaryLinks().should('have.length', TOTAL_FORM_FIELDS);
    });
  });

  describe('When a user clones a deal', () => {
    it('should progress to the dashboard page, display a success message, render correct cloned id/name and statuses for each facility', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankInternalRefNameInput().type('-cloned');
      pages.cloneDeal.additionalRefNameInput().type('-cloned');

      pages.cloneDeal.cloneTransactionsInput().click();

      cy.clickSubmitButton();

      cy.url().should('include', '/dashboard/');

      // confirm success message is displayed
      partials.successMessage.successMessage().should('be.visible');
      partials.successMessage.successMessageListItem().contains('cloned successfully');

      // click link to cloned deal
      partials.successMessage.successMessageLink().click();
      cy.url().should('include', '/contract/');

      // confirm new supply contract ID
      cy.assertText(pages.contract.bankInternalRefName(), `${deal.bankInternalRefName}-cloned`);

      // confirm new supply contract name
      cy.assertText(pages.contract.additionalRefName(), `Copy of ${deal.additionalRefName}-cloned`);

      // confirm deal status and previous status are wiped
      cy.assertText(pages.contract.status(), 'Draft');

      cy.assertText(pages.contract.previousStatus(), '-');

      // confirm About the Supply Contract is retained
      cy.assertText(pages.contract.aboutSupplierDetailsStatus(), 'Completed');

      // confirm Eligibility is now marked as 'Not started'
      cy.assertText(pages.contract.eligibilityStatus(), 'Not started');

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

      pages.cloneDeal.bankInternalRefNameInput();
      pages.cloneDeal.additionalRefNameInput();
      pages.cloneDeal.cloneTransactionsInput().click();

      cy.clickSubmitButton();

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

        cy.keyboardInput(pages.bondDetails.bondIssuerInput(), 'test');
        cy.clickSubmitButton();
        cy.url().should('include', '/bond');
        cy.url().should('include', '/financial-details');
        cy.visit(`/contract/${clonedDealId}`);
      });
    });

    it('user can view and edit the cloned loans', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankInternalRefNameInput();
      pages.cloneDeal.additionalRefNameInput();
      pages.cloneDeal.cloneTransactionsInput().click();

      cy.clickSubmitButton();

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
        loan.nameLink().click();
        cy.url().should('include', '/loan');
        cy.url().should('include', '/guarantee-details');

        pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
        cy.clickSubmitButton();
        cy.url().should('include', '/loan');
        cy.url().should('include', '/financial-details');
        cy.visit(`/contract/${clonedDealId}`);
      });
    });

    it('user can delete the cloned bonds and loans', () => {
      goToCloneDealPage(deal);

      pages.cloneDeal.bankInternalRefNameInput();
      pages.cloneDeal.additionalRefNameInput();
      pages.cloneDeal.cloneTransactionsInput().click();

      cy.clickSubmitButton();

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
          cy.clickSubmitButton();
          cy.visit(`/contract/${clonedDealId}`);
        });

        // delete loans
        pages.contract.loansTransactionsTableRows().each((loanTableRow) => {
          const loanId = loanTableRow.attr('data-cy').split('-')[1];
          const loan = pages.contract.loansTransactionsTable.row(loanId);
          loan.deleteLink().click();
          cy.url().should('eq', relative(`/contract/${clonedDealId}/loan/${loanId}/delete`));
          cy.clickSubmitButton();
          cy.visit(`/contract/${clonedDealId}`);
        });

        cy.visit(`/contract/${clonedDealId}`);
        pages.contract.bondTransactionsTableRows().should('have.length', 0);
        pages.contract.loansTransactionsTableRows().should('have.length', 0);
      });
    });
  });
});
