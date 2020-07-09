const pages = require('../../../pages');
const partials = require('../../../partials');
const BOND_FORM_VALUES = require('./bond-form-values');
const relative = require('../../../relativeURL');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

context('Add a Bond to a Deal', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then((insertedDeal) => deal = insertedDeal);
  });

  it('should allow a user to create a Deal, pass Red Line and add a Bond to the deal', () => {
    cy.createADeal({
      username: user.username,
      password: user.password,
      bankDealId: MOCK_DEAL.details.bankSupplyContractID,
      bankDealName: MOCK_DEAL.details.bankSupplyContractName,
    });

    cy.url().should('include', '/contract/');

    cy.addBondToDeal();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/bond/');
    cy.url().should('include', '/preview');
  });

  describe('when a user submits all Bond forms without completing any fields', () => {
    it('should display all validation errors for required fields in `Bond Preview` page', () => {
      cy.createADeal({
        username: user.username,
        password: user.password,
        bankDealId: MOCK_DEAL.details.bankSupplyContractID,
        bankDealName: MOCK_DEAL.details.bankSupplyContractName,
      });
      pages.contract.addBondButton().click();
      pages.bondDetails.submit().click();
      pages.bondFinancialDetails.submit().click();
      pages.bondFeeDetails.submit().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/bond/');
      cy.url().should('include', '/preview');
      cy.title().should('eq', `Bond Preview${pages.defaults.pageTitleAppend}`);
      const TOTAL_REQUIRED_FORM_FIELDS = 8;
      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
    });
  });

  // TODO
  // describe('when a user creates a Bond without submitting anything', () => {
  //   it('bond should display `Incomplete` status in Deal page', () => {
  //   });
  // });

  describe('when a user submits a Bond form without completing any fields', () => {
    it('bond should display `Incomplete` status in Deal page', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();

      // get bondId, go back to Deal page
      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondDetails.saveGoBackButton().click();
        cy.url().should('eq', relative(`/contract/${deal._id}`));

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.bondStatus().invoke('text').then((text) => {
          expect(text.trim()).equal('Incomplete');
        });
      });
    });

    describe('after viewing the `Bond Preview` page', () => {
      it('should display validation errors in `Bond Details`, `Bond Financial Details` and `Bond Fee Details` pages', () => {
        cy.createADeal({
          username: user.username,
          password: user.password,
          bankDealId: MOCK_DEAL.details.bankSupplyContractID,
          bankDealName: MOCK_DEAL.details.bankSupplyContractName,
        });
        pages.contract.addBondButton().click();
        pages.bondDetails.submit().click();
        pages.bondFinancialDetails.submit().click();
        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/preview');

        partials.bondProgressNav.progressNavLinkBondDetails().click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 2);

        partials.bondProgressNav.progressNavLinkBondFinancialDetails().click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 4);

        partials.bondProgressNav.progressNavLinkBondFeeDetails().click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 2);
      });
    });

    it('should display a progress nav link to `Preview`', () => {
      cy.loginGoToDealPage(user, deal);

      pages.contract.addBondButton().click();
      pages.bondDetails.submit().click();

      cy.url().should('include', '/bond/');
      cy.url().should('include', '/financial-details');

      partials.bondProgressNav.progressNavLinkBondPreview().should('be.visible');
      partials.bondProgressNav.progressNavLinkBondPreview().click();

      cy.url().should('include', '/bond/');
      cy.url().should('include', '/preview');
    });
  });

  describe('When a user submits all required Bond form fields (`issued` bond stage, currency same as Supply Contract Currency)', () => {
    it('should progress to `Bond Preview` page and render submission details', () => {
      cy.createADeal({
        username: user.username,
        password: user.password,
        bankDealId: MOCK_DEAL.details.bankSupplyContractID,
        bankDealName: MOCK_DEAL.details.bankSupplyContractName,
      });

      cy.addBondToDeal();

      cy.url().should('include', '/preview');

      // check that at least one value is displayed
      // no need to check all as this is covered in UI component tests.
      pages.bondPreview.bondIssuer().invoke('text').then((text) => {
        expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.bondIssuer);
      });
    });

    it('should display a checked checkbox for all progress nav items and only text for `Preview`', () => {
      cy.loginGoToDealPage(user, deal);
      cy.addBondToDeal();
      cy.url().should('include', '/preview');

      partials.bondProgressNav.progressNavBondDetailsCompletedCheckbox().should('be.visible');
      partials.bondProgressNav.progressNavBondDetailsCompletedCheckbox().should('be.checked');

      partials.bondProgressNav.progressNavBondFinancialDetailsCompletedCheckbox().should('be.visible');
      partials.bondProgressNav.progressNavBondFinancialDetailsCompletedCheckbox().should('be.checked');

      partials.bondProgressNav.progressNavBondFeeDetailsCompletedCheckbox().should('be.visible');
      partials.bondProgressNav.progressNavBondFeeDetailsCompletedCheckbox().should('be.checked');

      partials.bondProgressNav.progressNavLinkBondPreview().should('not.be.visible');
      partials.bondProgressNav.progressNavBondTextPreview().should('be.visible');
      partials.bondProgressNav.progressNavBondTextPreview().invoke('text').then((text) => {
        expect(text.trim()).equal('Preview');
      });
    });

    it('should populate Deal page with the submitted bond, display `Completed` status and link to `Bond Details` page', () => {
      cy.loginGoToDealPage(user, deal);
      cy.addBondToDeal();
      cy.url().should('include', '/preview');

      // get bondId, go back to Deal page
      // assert that some inputted Bond data is displayed in the table
      partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondPreview.saveGoBackButton().click();
        cy.url().should('eq', relative(`/contract/${deal._id}`));

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumber().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.uniqueIdentificationNumber);
        });

        // TODO: UKEF facility ID (when built)

        row.bondStatus().invoke('text').then((text) => {
          expect(text.trim()).equal('Completed');
        });

        row.facilityValue().invoke('text').then((text) => {
          const expectedValue = `${deal.submissionDetails.supplyContractCurrency.id} ${BOND_FORM_VALUES.FINANCIAL_DETAILS.facilityValue}`;
          expect(text.trim()).equal(expectedValue);
        });

        row.bondStage().invoke('text').then((text) => {
          expect(text.trim()).equal('Issued');
        });

        row.requestedCoverStartDate().invoke('text').then((text) => {
          const expectedDate = `${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay}/${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth}/${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear}`;
          expect(text.trim()).equal(expectedDate);
        });

        row.coverEndDate().invoke('text').then((text) => {
          const expectedDate = `${BOND_FORM_VALUES.DETAILS.coverEndDateDay}/${BOND_FORM_VALUES.DETAILS.coverEndDateMonth}/${BOND_FORM_VALUES.DETAILS.coverEndDateYear}`;
          expect(text.trim()).equal(expectedDate);
        });

        // assert that clicking the `unique number` link progesses to the Bond Details page
        row.uniqueNumber().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/details');
      });
    });
  });

  describe('When a user clicks `save and go back` button in `Bond Preview` page', () => {
    it('should return to Deal page', () => {
      cy.loginGoToDealPage(user, deal);
      cy.addBondToDeal();
      cy.url().should('include', '/preview');

      pages.bondPreview.saveGoBackButton().click();

      cy.url().should('not.include', '/preview');
      cy.url().should('include', '/contract');
      cy.url().should('not.include', '/bond');
    });
  });
});
