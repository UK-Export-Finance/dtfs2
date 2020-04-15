const pages = require('../../../pages');
const BOND_FORM_VALUES = require('./bond-form-values');
const fillBondForm = require('./fill-bond-forms');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Add a bond', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user);
  });

  describe('When a user clicks `Add a Bond` from the deal page', () => {
    it('should progress to the `Bond Details` page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        cy.url().should('include', '/contract');

        pages.contract.addBondButton().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/details');
      });
    });
  });

  describe('When a user completes all Bond forms', () => {
    it('should populate Bond Preview page with the submitted data', () => {
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
          expect(text.trim()).equal('unissued');
        });

        // pages.bondPreview.requestedCoverStartDate().should('have.text', 'TBD');
        // pages.bondPreview.coverEndDate().should('have.text', 'TBD');
        // pages.bondPreview.uniqueIdentificationNumber().should('have.text', 'TBD');

        pages.bondPreview.bondBeneficiary().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.DETAILS.bondBeneficiary);
        });

        // bond financial details
        pages.bondPreview.bondValue().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.FINANCIAL_DETAILS.bondValue);
        });

        // TODO: hook up
        // pages.bondPreview.transactionCurrencySameAsSupplyContractCurrency().invoke('text').then((text) => {
        //   expect(text.trim()).equal(BOND_FORM_VALUES.FINANCIAL_DETAILS.currency.value);
        // });

        pages.bondPreview.riskMarginFee().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.FINANCIAL_DETAILS.riskMarginFee);
        });

        pages.bondPreview.coveredPercentage().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
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
  });
});
