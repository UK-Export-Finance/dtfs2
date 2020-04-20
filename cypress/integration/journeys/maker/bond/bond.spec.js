const pages = require('../../../pages');
const partials = require('../../../partials');
const BOND_FORM_VALUES = require('./bond-form-values');
const fillBondForm = require('./fill-bond-forms');
const relative = require('../../../relativeURL');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Add a Bond to a Deal', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user);
  });

  it('should allow a user to create a Deal, pass Red Line and add a Bond to the deal', () => {
    cy.passRedLine(user);

    // complete 'before you start' form fields
    pages.bankDetails.bankDealId().type('TEST1234');
    pages.bankDetails.bankDealName().type('TESTING');
    pages.bankDetails.submit().click();

    cy.url().should('include', '/contract/');

    pages.contract.addBondButton().click();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/bond/');
    cy.url().should('include', '/details');

    fillBondForm.details();
    pages.bondDetails.submit().click();

    fillBondForm.financialDetails();
    pages.bondFinancialDetails.submit().click();

    fillBondForm.feeDetails();
    pages.bondFeeDetails.submit().click();

    cy.url().should('include', '/preview');
  });

  describe('When a user completes all Bond forms (`issued` bond stage, currency same as Supply Contract Currency)', () => {
    it('should populate Bond Preview page with all submitted data', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        fillBondForm.details();
        pages.bondDetails.submit().click();

        fillBondForm.financialDetails();
        pages.bondFinancialDetails.submit().click();

        fillBondForm.feeDetails();
        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/preview');

        // bond details
        pages.bondPreview.bondIssuer().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.bondIssuer);
        });

        pages.bondPreview.bondType().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.bondType.value);
        });

        pages.bondPreview.bondStage().invoke('text').then((text) => {
          expect(text.trim()).equal('Issued');
        });

        const expectedCoverStartDate = `${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateDay}/${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateMonth}/${BOND_FORM_VALUES.DETAILS.requestedCoverStartDateYear}`;

        pages.bondPreview.requestedCoverStartDate().invoke('text').then((text) => {
          expect(text.trim()).equal(expectedCoverStartDate);
        });

        const expectedCoverEndDate = `${BOND_FORM_VALUES.DETAILS.coverEndDateDay}/${BOND_FORM_VALUES.DETAILS.coverEndDateMonth}/${BOND_FORM_VALUES.DETAILS.coverEndDateYear}`;

        pages.bondPreview.coverEndDate().invoke('text').then((text) => {
          expect(text.trim()).equal(expectedCoverEndDate);
        });

        pages.bondPreview.uniqueIdentificationNumber().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.uniqueIdentificationNumber);
        });

        pages.bondPreview.bondBeneficiary().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.bondBeneficiary);
        });

        // bond financial details
        pages.bondPreview.bondValue().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.FINANCIAL_DETAILS.bondValue);
        });

        pages.bondPreview.riskMarginFee().invoke('text').then((text) => {
          expect(text.trim()).equal(`${BOND_FORM_VALUES.FINANCIAL_DETAILS.riskMarginFee}%`);
        });

        pages.bondPreview.coveredPercentage().invoke('text').then((text) => {
          expect(text.trim()).equal(`${BOND_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage}%`);
        });

        pages.bondPreview.minimumRiskMarginFee().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.FINANCIAL_DETAILS.minimumRiskMarginFee);
        });

        // TODO: this is currently disabled and not hooked up to anything
        // pages.bondPreview.guaranteeFeePayableByBank().invoke('text').then((text) => {
        //   expect(text.trim()).equal('?');
        // });

        // TODO: this is currently disabled and not hooked up to anything
        // pages.bondPreview.ukefExposure().invoke('text').then((text) => {
        //   expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.TEST);
        // });

        // bond fee details
        pages.bondPreview.feeType().invoke('text').then((text) => {
          expect(text.trim()).equal('At maturity');
        });

        pages.bondPreview.feeFrequency().invoke('text').then((text) => {
          expect(text.trim()).equal('Annually');
        });

        pages.bondPreview.dayCountBasis().invoke('text').then((text) => {
          expect(text.trim()).equal('365');
        });
      });
    });

    it('should populate Deal page with the submitted bond and link to bond details page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        fillBondForm.details();
        pages.bondDetails.submit().click();

        fillBondForm.financialDetails();
        pages.bondFinancialDetails.submit().click();

        fillBondForm.feeDetails();

        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/preview');

        // get bondId, go back to deal page
        // assert that some inputted bond data is displayed in the table
        partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
          const bondId = bondIdHiddenInput[0].value;

          pages.bondPreview.saveGoBackButton().click();
          cy.url().should('eq', relative(`/contract/${deal._id}`));

          const row = pages.contract.bondTransactionsTable.row(bondId);

          row.uniqueNumber().invoke('text').then((text) => {
            expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.uniqueIdentificationNumber);
          });

          // TODO: UKEF facility ID (when built)

          // TODO: status (when built)

          row.bondValue().invoke('text').then((text) => {
            const expectedValue = `${deal.supplyContractCurrency.id} ${BOND_FORM_VALUES.FINANCIAL_DETAILS.bondValue}`;
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

          // assert that clicking the `unique number` link progesses to the bond page
          row.uniqueNumber().click();
          cy.url().should('include', '/contract');
          cy.url().should('include', '/bond/');
          cy.url().should('include', '/details');
        });
      });
    });
  });

  describe('When a user clicks `save and go back` button in Bond Preview page', () => {
    it('should return to Deal page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();
        partials.bondProgressNav.progressNavBondPreview().click();
        cy.url().should('include', '/preview');

        partials.bondProgressNav.bondId().then((bondIdHiddenInput) => {
          const bondId = bondIdHiddenInput[0].value;

          pages.bondPreview.saveGoBackButton().click();

          cy.url().should('not.include', '/preview');
          cy.url().should('include', '/contract');

          const row = pages.contract.bondTransactionsTable.row(bondId);

          row.uniqueNumber().click();
          partials.bondProgressNav.progressNavBondPreview().click();
          cy.url().should('include', '/preview');
        });
      });
    });
  });
});
