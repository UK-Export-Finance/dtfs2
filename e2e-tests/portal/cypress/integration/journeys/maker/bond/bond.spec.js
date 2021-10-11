const pages = require('../../../pages');
const partials = require('../../../partials');
const BOND_FORM_VALUES = require('./bond-form-values');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

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
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('should allow a user to create a Deal, pass Red Line and add a Bond to the deal', () => {
    cy.createADeal({
      username: MAKER_LOGIN.username,
      password: MAKER_LOGIN.password,
      bankDealId: MOCK_DEAL.details.bankSupplyContractID,
      bankDealName: MOCK_DEAL.details.bankSupplyContractName,
    });

    cy.url().should('include', '/contract/');

    cy.addBondToDeal();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/bond/');
    cy.url().should('include', '/check-your-answers');
  });

  describe('when a user submits all Bond forms without completing any fields', () => {
    it('should display all validation errors for required fields in `Check your answers` page', () => {
      cy.createADeal({
        username: MAKER_LOGIN.username,
        password: MAKER_LOGIN.password,
        bankDealId: MOCK_DEAL.details.bankSupplyContractID,
        bankDealName: MOCK_DEAL.details.bankSupplyContractName,
      });
      pages.contract.addBondButton().click();
      pages.bondDetails.submit().click();
      pages.bondFinancialDetails.submit().click();

      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;
        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/check-your-answers');
        cy.title().should('eq', `Check your answers - Bond - ${bondId}${pages.defaults.pageTitleAppend}`);
        const TOTAL_REQUIRED_FORM_FIELDS = 8;
        partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);
      });
    });
  });

  describe('when a user submits a Bond form without completing any fields', () => {
    it('bond should display `Incomplete` status in Deal page', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);

      pages.contract.addBondButton().click();

      // get bondId, go back to Deal page
      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
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
      it('should display validation errors in `Bond Details`, `Bond Financial Details` and `Bond Fee Details` pages and a link to `Check your answers` page', () => {
        cy.createADeal({
          username: MAKER_LOGIN.username,
          password: MAKER_LOGIN.password,
          bankDealId: MOCK_DEAL.details.bankSupplyContractID,
          bankDealName: MOCK_DEAL.details.bankSupplyContractName,
        });
        pages.contract.addBondButton().click();
        pages.bondDetails.submit().click();
        pages.bondFinancialDetails.submit().click();
        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/check-your-answers');

        partials.taskListHeader.itemLink('bond-details').click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 2);

        partials.taskListHeader.itemLink('financial-details').click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 4);

        partials.taskListHeader.itemLink('fee-details').click();
        partials.errorSummary.errorSummaryLinks().should('have.length', 2);

        partials.taskListHeader.checkYourAnswersLink().should('be.visible');
        partials.taskListHeader.checkYourAnswersLink().click();

        cy.url().should('include', '/bond/');
        cy.url().should('include', '/check-your-answers');
      });
    });
  });

  describe('When a user submits all required Bond form fields (`issued` facility stage, currency same as Supply Contract Currency)', () => {
    it('should progress to `Bond Preview` page and render submission details', () => {
      cy.createADeal({
        username: MAKER_LOGIN.username,
        password: MAKER_LOGIN.password,
        bankDealId: MOCK_DEAL.details.bankSupplyContractID,
        bankDealName: MOCK_DEAL.details.bankSupplyContractName,
      });

      cy.addBondToDeal();

      cy.url().should('include', '/check-your-answers');

      pages.bondPreview.submissionDetails().should('be.visible');
    });

    it('should display a `completed` status tag for all Bond forms in task list header and a `check your answers` link', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);
      cy.addBondToDeal();
      cy.url().should('include', '/check-your-answers');

      partials.taskListHeader.itemStatus('bond-details').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.itemStatus('financial-details').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.itemStatus('fee-details').invoke('text').then((text) => {
        expect(text.trim()).equal('Completed');
      });

      partials.taskListHeader.checkYourAnswersLink().should('be.visible');

      partials.taskListHeader.checkYourAnswersLink().invoke('text').then((text) => {
        expect(text.trim()).equal('Check your answers');
      });
    });

    it('should populate Deal page with the submitted bond, display `Completed` status and link to `Bond Details` page', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);
      cy.addBondToDeal();
      cy.url().should('include', '/check-your-answers');

      // get bondId, go back to Deal page
      // assert that some inputted Bond data is displayed in the table
      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        pages.bondPreview.saveGoBackButton().click();
        cy.url().should('eq', relative(`/contract/${deal._id}`));

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumberLink().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.uniqueIdentificationNumber);
        });

        row.bondStatus().invoke('text').then((text) => {
          expect(text.trim()).equal('Completed');
        });

        row.facilityValue().invoke('text').then((text) => {
          const expectedValue = `${deal.submissionDetails.supplyContractCurrency.id} ${BOND_FORM_VALUES.FINANCIAL_DETAILS.facilityValue}`;
          expect(text.trim()).equal(expectedValue);
        });

        row.facilityStage().invoke('text').then((text) => {
          expect(text.trim()).equal('Issued');
        });

        row.requestedCoverStartDate().invoke('text').then((text) => {
          const coverStartDate = `${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay}/${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth}/${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear}`;

          expect(text.trim()).equal(coverStartDate);
        });

        row.coverEndDate().invoke('text').then((text) => {
          const expectedDate = `${BOND_FORM_VALUES.DETAILS.coverEndDateDay}/${BOND_FORM_VALUES.DETAILS.coverEndDateMonth}/${BOND_FORM_VALUES.DETAILS.coverEndDateYear}`;
          expect(text.trim()).equal(expectedDate);
        });

        // assert that clicking the `unique number` link progesses to the Bond Details page
        row.uniqueNumberLink().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/details');
      });
    });
  });

  describe('When a user clicks `save and go back` button in `Bond Preview` page', () => {
    it('should return to Deal page', () => {
      cy.loginGoToDealPage(MAKER_LOGIN, deal);
      cy.addBondToDeal();
      cy.url().should('include', '/check-your-answers');

      pages.bondPreview.saveGoBackButton().click();

      cy.url().should('not.include', '/check-your-answers');
      cy.url().should('include', '/contract');
      cy.url().should('not.include', '/bond');
    });
  });
});
