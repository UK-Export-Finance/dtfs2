const componentRenderer = require('../../componentRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'bond/_macros/bond-submission-details.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const user = {
    roles: ['maker'],
    timezone: 'Europe/London',
  };

  const bond = deal.bonds[0];
  bond.issuedDate = '1603367125920';
  bond.requestedCoverStartDate = '1603367125920';
  bond.currencySameAsSupplyContractCurrency = 'false';

  beforeEach(() => {
    wrapper = render({
      bond,
      user,
    });
  });

  it('should render bondIssuer', () => {
    wrapper.expectText('[data-cy="bond-issuer"]').toRead(bond.bondIssuer);
  });

  it('should render bondType', () => {
    wrapper.expectText('[data-cy="bond-type"]').toRead(bond.bondType);
  });

  it('should render facilityStage', () => {
    wrapper.expectText('[data-cy="facility-stage"]').toRead(bond.facilityStage);
  });

  it('should render facilityStage', () => {
    wrapper.expectText('[data-cy="facility-stage"]').toRead(bond.facilityStage);
  });

  it('should render issuedDate', () => {
    wrapper.expectElement('[data-cy="issued-date"]').toExist();
  });

  it('should render requestedCoverStartDate', () => {
    wrapper.expectElement('[data-cy="requested-cover-start-date"]').toExist();
  });

  it('should render coverEndDate', () => {
    const expected = `${bond['coverEndDate-day']}/${bond['coverEndDate-month']}/${bond['coverEndDate-year']}`;
    wrapper.expectText('[data-cy="cover-end-date"]').toRead(expected);
  });

  it('should render name', () => {
    wrapper.expectText('[data-cy="name"]').toRead(bond.name);
  });

  it('should render ukefGuaranteeInMonths', () => {
    wrapper.expectText('[data-cy="ukef-guarantee-in-months"]').toRead(bond.ukefGuaranteeInMonths);
  });

  it('should render bondBeneficiary', () => {
    wrapper.expectText('[data-cy="bond-beneficiary"]').toRead(bond.bondBeneficiary);
  });

  it('should render value', () => {
    wrapper.expectText('[data-cy="facility-value"]').toRead(bond.value);
  });

  describe('currencySameAsSupplyContractCurrency', () => {
    const selector = '[data-cy="currency-same-as-supply-contract-currency"]';

    it('should render `Yes` when value is `true`', () => {
      const bondWithCurrencySameAsSupplyContractCurrency = {
        ...bond,
        currencySameAsSupplyContractCurrency: 'true',
      };

      wrapper = render({
        user,
        bond: bondWithCurrencySameAsSupplyContractCurrency,
      });

      wrapper.expectText(selector).toRead('Yes');
    });

    it('should render `No` when value is false', () => {
      const bondWithCurrencyNotTheSameAsSupplyContractCurrency = {
        ...bond,
        currencySameAsSupplyContractCurrency: 'false',
      };

      wrapper = render({
        user,
        bond: bondWithCurrencyNotTheSameAsSupplyContractCurrency,
      });

      wrapper.expectText(selector).toRead('No');
    });
  });

  it('should render currency', () => {
    wrapper.expectText('[data-cy="currency"]').toRead(bond.currency.text);
  });

  it('should render conversionRate', () => {
    wrapper.expectText('[data-cy="conversion-rate"]').toRead(bond.conversionRate);
  });

  it('should render conversionRateDate', () => {
    const expected = `${bond['conversionRateDate-day']}/${bond['conversionRateDate-month']}/${bond['conversionRateDate-year']}`;
    wrapper.expectText('[data-cy="conversion-rate-date"]').toRead(expected);
  });

  it('should render riskMarginFee', () => {
    wrapper.expectText('[data-cy="risk-margin-fee"]').toRead(`${bond.riskMarginFee}%`);
  });

  it('should render coveredPercentage', () => {
    wrapper.expectText('[data-cy="covered-percentage"]').toRead(`${bond.coveredPercentage}%`);
  });

  it('should render minimumRiskMarginFee', () => {
    wrapper.expectText('[data-cy="minimum-risk-margin-fee"]').toRead(bond.minimumRiskMarginFee);
  });

  it('should render guaranteeFeePayableByBank', () => {
    wrapper.expectText('[data-cy="guarantee-fee-payable-by-bank"]').toRead(bond.guaranteeFeePayableByBank);
  });

  it('should render ukefExposure', () => {
    wrapper.expectText('[data-cy="ukef-exposure"]').toRead(bond.ukefExposure);
  });

  it('should render feeType', () => {
    wrapper.expectText('[data-cy="fee-type"]').toRead(bond.feeType);
  });

  it('should render feeFrequency', () => {
    wrapper.expectText('[data-cy="fee-frequency"]').toRead(bond.feeFrequency);
  });

  it('should render dayCountBasis', () => {
    wrapper.expectText('[data-cy="day-count-basis"]').toRead(bond.dayCountBasis);
  });

  describe('when currencySameAsSupplyContractCurrency is `false`', () => {
    const bondWithCurrencyNotTheSameAsSupplyContractCurrency = {
      ...bond,
      currencySameAsSupplyContractCurrency: 'true',
    };

    beforeEach(() => {
      wrapper = render({
        user,
        bond: bondWithCurrencyNotTheSameAsSupplyContractCurrency,
      });
    });

    it('should NOT render currency', () => {
      wrapper.expectElement('[data-cy="currency"]').notToExist();
    });

    it('should NOT render conversionRate', () => {
      wrapper.expectElement('[data-cy="conversion-rate"]').notToExist();
    });

    it('should NOT render conversionRateDate', () => {
      wrapper.expectElement('[data-cy="conversion-rate-date"]').notToExist();
    });
  });
});
