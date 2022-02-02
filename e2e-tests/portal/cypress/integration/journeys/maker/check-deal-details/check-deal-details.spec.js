const relative = require('../../../relativeURL');
const pages = require('../../../pages');
const fullyCompletedDeal = require('../fixtures/dealFullyCompleted');
const MOCK_USERS = require('../../../../fixtures/users');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS

const dealInDraft = {
  ...fullyCompletedDeal,
  status: 'Draft',
};

context('Check deal details', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(dealInDraft, BANK1_MAKER1)
      .then((insertedDeal) => {
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

  afterEach(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  const goToCheckDealDetailsPage = () => {
    pages.contract.visit(deal);
    pages.contract.checkDealDetailsTab().click();
    cy.url().should('eq', relative(`/contract/${dealId}/submission-details`));
  };

  it('Edit links take the Maker back to the relevant form', () => {
    cy.login(BANK1_MAKER1);

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
    const bondId = dealFacilities.bonds[0]._id;

    pages.contractSubmissionDetails.editLinkBond(dealId, bondId).should('be.visible');
    pages.contractSubmissionDetails.editLinkBond(dealId, bondId).click();
    cy.url().should('eq', relative(`/contract/${dealId}/bond/${bondId}/details`));

    //---------------------------------------------------------------
    // A Loan
    //---------------------------------------------------------------
    goToCheckDealDetailsPage();
    const loanId = dealFacilities.loans[0]._id;

    pages.contractSubmissionDetails.editLinkLoan(dealId, loanId).should('be.visible');
    pages.contractSubmissionDetails.editLinkLoan(dealId, loanId).click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/guarantee-details`));
  });

  it('Should only display bond currency if different to deal', () => {
    cy.login(BANK1_MAKER1);

    goToCheckDealDetailsPage();

    const differentBondCurrencyId = dealFacilities.bonds[0]._id;
    const differentBondCurrency = pages.contractSubmissionDetails.currencyInfoFacility('bond', differentBondCurrencyId);
    differentBondCurrency.sameAsDealCurrency().should('contain.text', 'No');
    differentBondCurrency.currency().should('exist');
    differentBondCurrency.conversionRate().should('exist');

    const sameBondCurrencyId = dealFacilities.bonds[1]._id;
    const sameBondCurrency = pages.contractSubmissionDetails.currencyInfoFacility('bond', sameBondCurrencyId);
    sameBondCurrency.sameAsDealCurrency().should('contain.text', 'Yes');
    sameBondCurrency.currency().should('not.exist');
    sameBondCurrency.conversionRate().should('not.exist');

    const differentLoanCurrencyId = dealFacilities.loans[1]._id;
    const differentLoanCurrency = pages.contractSubmissionDetails.currencyInfoFacility('loan', differentLoanCurrencyId);
    differentLoanCurrency.sameAsDealCurrency().should('contain.text', 'No');
    differentLoanCurrency.currency().should('exist');
    differentLoanCurrency.conversionRate().should('exist');

    const sameLoanCurrencyId = dealFacilities.loans[0]._id;
    const sameLoanCurrency = pages.contractSubmissionDetails.currencyInfoFacility('loan', sameLoanCurrencyId);
    sameLoanCurrency.sameAsDealCurrency().should('contain.text', 'Yes');
    sameLoanCurrency.currency().should('not.exist');
    sameLoanCurrency.conversionRate().should('not.exist');
  });

  it('Should display mandatory criteria box with given mandatory criteria', () => {
    // Older migrated v1 deals do not have mandatory criteria
    cy.login(BANK1_MAKER1);
    goToCheckDealDetailsPage();
    pages.contractSubmissionDetails.mandatoryCriteriaBox().should('exist');
  });

  it('Should display agents address under criteria 11', () => {
    // Older migrated v1 deals do not have mandatory criteria
    cy.login(BANK1_MAKER1);
    goToCheckDealDetailsPage();
    pages.eligibilityCriteria.eligibilityAgent(11).should('exist');
    pages.eligibilityCriteria.eligibilityAgent(1).should('not.exist');
  });

  context('Portal_v1 migrated deals', () => {
    const dealNoMandatoryCriteria = {
      ...dealInDraft,
      mandatoryCriteria: [],
    };

    beforeEach(() => {
      cy.insertOneDeal(dealNoMandatoryCriteria, BANK1_MAKER1)
        .then((insertedDeal) => {
          const dealWithCriteria1 = {
            ...insertedDeal,
            eligibility: {
              ...insertedDeal.eligibility,
              criteria: [
                {
                  id: 1,
                  description: 'The Supplier has confirmed in its Supplier Supplementary Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
                  answer: false,
                  group: 'Supply Contract / Transaction criteria',
                },
                ...insertedDeal.eligibility.criteria,
              ],
            },
          };

          cy.updateDeal(insertedDeal._id, dealWithCriteria1, BANK1_MAKER1).then((updatedDeal) => {
            deal = updatedDeal;
            dealId = deal._id;
          });
        });
    });

    it('Should not display mandatory criteria box when no given mandatory criteria', () => {
      // Older migrated v1 deals do not have mandatory criteria
      cy.login(BANK1_MAKER1);
      goToCheckDealDetailsPage();
      pages.contractSubmissionDetails.mandatoryCriteriaBox().should('not.exist');
    });

    it('Should display agents address under criteria 1', () => {
      // Older migrated v1 deals do not have mandatory criteria
      cy.login(BANK1_MAKER1);
      goToCheckDealDetailsPage();
      pages.eligibilityCriteria.eligibilityAgent(1).should('exist');
      pages.eligibilityCriteria.eligibilityAgent(11).should('not.exist');
    });
  });
});
