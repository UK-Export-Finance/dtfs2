const pages = require('../../pages');
const partials = require('../../partials');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

const BOND_DETAILS_FORM_VALUES = {
  bondIssuer: 'mock issuer',
  bondType: {
    value: 'maintenanceBond',
    text: 'Maintenance bond',
  },
  ukefGuaranteeInMonths: '12',
  bondBeneficiary: 'mock beneficiary',
};

const BOND_FINANCIAL_DETAILS_FORM_VALUES = {
  bondValue: '123',
  currency: {
    value: 'GBP',
    text: 'GBP - UK Sterling',
  },
  conversionRate: '100',
  conversionRateDateDay: '01',
  conversionRateDateMonth: '02',
  conversionRateDateYear: '2020',
  riskMarginFee: '20',
  coveredPercentage: '80',
  minimumRiskMarginFee: '1.23',
};

const fillBondDetailsForm = () => {
  pages.bondDetails.bondIssuerInput().type(BOND_DETAILS_FORM_VALUES.bondIssuer);
  pages.bondDetails.bondTypeInput().select(BOND_DETAILS_FORM_VALUES.bondType.value);
  pages.bondDetails.bondStageUnissuedInput().click();
  pages.bondDetails.ukefGuaranteeInMonthsInput().type(BOND_DETAILS_FORM_VALUES.ukefGuaranteeInMonths);
  pages.bondDetails.bondBeneficiaryInput().type(BOND_DETAILS_FORM_VALUES.bondBeneficiary);
};

const fillBondFinancialDetailsForm = () => {
  pages.bondFinancialDetails.bondValueInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.bondValue);
  pages.bondFinancialDetails.transactionCurrencySameAsSupplyContractCurrencyYesInput().click();
  pages.bondFinancialDetails.riskMarginFeeInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.riskMarginFee);
  pages.bondFinancialDetails.coveredPercentageInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.coveredPercentage);
  pages.bondFinancialDetails.minimumRiskMarginFeeInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.minimumRiskMarginFee);
};

const fillBondFeeDetailsForm = () => {
  pages.bondFeeDetails.feeTypeAtMaturityInput().click();
  pages.bondFeeDetails.feeFrequencyAnnuallyInput().click();
  pages.bondFeeDetails.dayCountBasis365Input().click();
};

context('Add a bond', () => {
  // let deal;

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

  describe('When a user completes the `Bond Details` form', () => {
    it('should progress to the `Bond Financial Details` page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        fillBondDetailsForm();
        pages.bondDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/financial-details');
      });
    });
  });

  // TODO: bond details - when selected issued/unissued, correct form fields appear

  describe('When a user completes the `Bond Financial Details` form', () => {
    it('should progress to the bond `Fee Details` page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();
        partials.bondProgressNav.progressNavBondFinancialDetails().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/financial-details');

        fillBondFinancialDetailsForm();
        pages.bondFinancialDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/fee-details');
      });
    });
  });

  // TODO: financial details - when selected yes/no currency, correct form fields appear
  // pages.bondFinancialDetails.currencyInput().select(BOND_FINANCIAL_DETAILS_FORM_VALUES.currency.value);
  // pages.bondFinancialDetails.conversionRateInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.conversionRate);
  // pages.bondFinancialDetails.conversionRateDateDayInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.conversionRateDateDay);
  // pages.bondFinancialDetails.conversionRateDateMonthInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.conversionRateDatMonth);
  // pages.bondFinancialDetails.conversionRateDateYearInput().type(BOND_FINANCIAL_DETAILS_FORM_VALUES.conversionRateDateYear);

  // TODO: financial details - disabled inputs guaranteeFeePayableByBank and ukefExposure work as expected
  // functionality needs to be done first - assuming these get automatically populated

  describe('When a user completes the `Bond Fee Details` form', () => {
    it('should progress to the `Bond Preview` page', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();
        partials.bondProgressNav.progressNavBondFeeDetails().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/fee-details');

        fillBondFeeDetailsForm();
        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/contract');
        cy.url().should('include', '/bond/');
        cy.url().should('include', '/preview');
      });
    });
  });

  describe('When a user completes all Bond forms', () => {
    it('should populate Bond Preview page with the submitted data', () => {
      cy.allDeals().then((deals) => {
        const deal = deals[0];
        cy.loginGoToDealPage(user, deal);

        pages.contract.addBondButton().click();

        fillBondDetailsForm();
        pages.bondDetails.submit().click();

        fillBondFinancialDetailsForm();
        pages.bondFinancialDetails.submit().click();

        fillBondFeeDetailsForm();
        pages.bondFeeDetails.submit().click();

        cy.url().should('include', '/preview');

        // bond details
        pages.bondPreview.bondIssuer().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_DETAILS_FORM_VALUES.bondIssuer);
        });

        pages.bondPreview.bondType().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_DETAILS_FORM_VALUES.bondType.value);
        });

        pages.bondPreview.bondStage().invoke('text').then((text) => {
          expect(text.trim()).equal('unissued');
        });

        // pages.bondPreview.requestedCoverStartDate().should('have.text', 'TBD');
        // pages.bondPreview.coverEndDate().should('have.text', 'TBD');
        // pages.bondPreview.uniqueIdentificationNumber().should('have.text', 'TBD');

        pages.bondPreview.bondBeneficiary().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_DETAILS_FORM_VALUES.bondBeneficiary);
        });

        // bond financial details
        pages.bondPreview.bondValue().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FINANCIAL_DETAILS_FORM_VALUES.bondValue);
        });

        // TODO: hook up
        // pages.bondPreview.transactionCurrencySameAsSupplyContractCurrency().invoke('text').then((text) => {
        //   expect(text.trim()).equal(BOND_FINANCIAL_DETAILS_FORM_VALUES.currency.value);
        // });

        pages.bondPreview.riskMarginFee().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FINANCIAL_DETAILS_FORM_VALUES.riskMarginFee);
        });

        pages.bondPreview.coveredPercentage().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FINANCIAL_DETAILS_FORM_VALUES.coveredPercentage);
        });

        pages.bondPreview.minimumRiskMarginFee().invoke('text').then((text) => {
          expect(text.trim()).equal(BOND_FINANCIAL_DETAILS_FORM_VALUES.minimumRiskMarginFee);
        });

        // TODO: this is currently disabled and not hooked up to anything
        // pages.bondPreview.guaranteeFeePayableByBank().invoke('text').then((text) => {
        //   expect(text.trim()).equal('?');
        // });

        // TODO: this is currently disabled and not hooked up to anything
        // pages.bondPreview.ukefExposure().invoke('text').then((text) => {
        //   expect(text.trim()).equal(BOND_DETAILS_FORM_VALUES.TEST);
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
