const componentRenderer = require('../../componentRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'bond/_macros/bond-submission-details.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const bond = deal.bondTransactions.items[0];

  beforeEach(() => {
    wrapper = render(bond);
  });

  it('should render bondIssuer', () => {
    wrapper.expectText('[data-cy="bond-issuer"]').toRead(bond.bondIssuer);
  });

  it('should render bondType', () => {
    wrapper.expectText('[data-cy="bond-type"]').toRead(bond.bondType);
  });

  it('should render bondStage', () => {
    wrapper.expectText('[data-cy="bond-stage"]').toRead(bond.bondStage);
  });

  it('should render bondStage', () => {
    wrapper.expectText('[data-cy="bond-stage"]').toRead(bond.bondStage);
  });

  it('should render requestedCoverStartDate', () => {
    const expected = `${bond['requestedCoverStartDate-day']}/${bond['requestedCoverStartDate-month']}/${bond['requestedCoverStartDate-year']}`;
    wrapper.expectText('[data-cy="requested-cover-start-date"]').toRead(expected);
  });

  it('should render coverEndDate', () => {
    const expected = `${bond['coverEndDate-day']}/${bond['coverEndDate-month']}/${bond['coverEndDate-year']}`;
    wrapper.expectText('[data-cy="cover-end-date"]').toRead(expected);
  });

  it('should render uniqueIdentificationNumber', () => {
    wrapper.expectText('[data-cy="unique-identification-number"]').toRead(bond.uniqueIdentificationNumber);
  });

  it('should render ukefGuaranteeInMonths', () => {
    wrapper.expectText('[data-cy="ukef-guarantee-in-months"]').toRead(bond.ukefGuaranteeInMonths);
  });

  it('should render bondBeneficiary', () => {
    wrapper.expectText('[data-cy="bond-beneficiary"]').toRead(bond.bondBeneficiary);
  });

  it('should render facilityValue', () => {
    wrapper.expectText('[data-cy="facility-value"]').toRead(bond.facilityValue);
  });

  describe('currencySameAsSupplyContractCurrency', () => {
    const selector = '[data-cy="currency-same-as-supply-contract-currency"]';

    it('should render `Yes` when value is `true`', () => {
      wrapper = render({
        ...bond,
        currencySameAsSupplyContractCurrency: 'true',
      });
      wrapper.expectText(selector).toRead('Yes');
    });

    it('should render `No` when value is false', () => {
      wrapper = render({
        ...bond,
        currencySameAsSupplyContractCurrency: 'false',
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
});
