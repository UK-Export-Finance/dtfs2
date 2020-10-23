const relative = require('../../../relativeURL');
const pages = require('../../../pages');
const fullyCompletedDeal = require('../fixtures/dealFullyCompleted');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

const dealInDraft = {
  ...fullyCompletedDeal,
  details: {
    ...fullyCompletedDeal.details,
    status: 'Draft',
  },
};

context('Check deal details', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(dealInDraft, MAKER_LOGIN)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  const goToCheckDealDetailsPage = () => {
    pages.contract.visit(deal);
    pages.contract.checkDealDetailsTab().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details`));
  };

  it('Edit links take the Maker back to the relevant form', () => {
    cy.login({ ...MAKER_LOGIN });

    //---------------------------------------------------------------
    // About supplier
    //---------------------------------------------------------------
    goToCheckDealDetailsPage();

    pages.contractSubmissionDetails.editLinkAboutSupplier(dealId).should('be.visible');
    pages.contractSubmissionDetails.editLinkAboutSupplier(dealId).click();
    cy.url().should('eq', relative(`/contract/${dealId}/about/supplier`));


    //---------------------------------------------------------------
    // Confirm Eligibility
    //---------------------------------------------------------------
    goToCheckDealDetailsPage();

    pages.contractSubmissionDetails.editLinkConfirmEligibility(dealId).should('be.visible');
    pages.contractSubmissionDetails.editLinkConfirmEligibility(dealId).click();
    cy.url().should('eq', relative(`/contract/${dealId}/eligibility/criteria`));


    //---------------------------------------------------------------
    // A Bond
    //---------------------------------------------------------------
    goToCheckDealDetailsPage();
    const bondId = dealInDraft.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle

    pages.contractSubmissionDetails.editLinkBond(dealId, bondId).should('be.visible');
    pages.contractSubmissionDetails.editLinkBond(dealId, bondId).click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/details`));


    //---------------------------------------------------------------
    // A Loan
    //---------------------------------------------------------------
    goToCheckDealDetailsPage();
    const loanId = dealInDraft.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle

    pages.contractSubmissionDetails.editLinkLoan(dealId, loanId).should('be.visible');
    pages.contractSubmissionDetails.editLinkLoan(dealId, loanId).click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/guarantee-details`));
  });

  it('Should only display bond currency if different to deal', () => {
    cy.login({ ...MAKER_LOGIN });

    goToCheckDealDetailsPage();

    const differentBondCurrencyId = dealInDraft.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const differentBondCurrency = pages.contractSubmissionDetails.currencyInfoFacility('bond', differentBondCurrencyId);
    differentBondCurrency.sameAsDealCurrency().should('contain.text', 'No');
    differentBondCurrency.currency().should('exist');
    differentBondCurrency.conversionRate().should('exist');

    const sameBondCurrencyId = dealInDraft.bondTransactions.items[1]._id; // eslint-disable-line no-underscore-dangle
    const sameBondCurrency = pages.contractSubmissionDetails.currencyInfoFacility('bond', sameBondCurrencyId);
    sameBondCurrency.sameAsDealCurrency().should('contain.text', 'Yes');
    sameBondCurrency.currency().should('not.exist');
    sameBondCurrency.conversionRate().should('not.exist');

    const differentLoanCurrencyId = dealInDraft.loanTransactions.items[1]._id; // eslint-disable-line no-underscore-dangle
    const differentLoanCurrency = pages.contractSubmissionDetails.currencyInfoFacility('loan', differentLoanCurrencyId);
    differentLoanCurrency.sameAsDealCurrency().should('contain.text', 'No');
    differentLoanCurrency.currency().should('exist');
    differentLoanCurrency.conversionRate().should('exist');

    const sameLoanCurrencyId = dealInDraft.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const sameLoanCurrency = pages.contractSubmissionDetails.currencyInfoFacility('loan', sameLoanCurrencyId);
    sameLoanCurrency.sameAsDealCurrency().should('contain.text', 'Yes');
    sameLoanCurrency.currency().should('not.exist');
    sameLoanCurrency.conversionRate().should('not.exist');
  });
});
