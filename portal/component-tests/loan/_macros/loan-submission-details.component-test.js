const componentRenderer = require('../../componentRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'loan/_macros/loan-submission-details.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const loan = deal.loanTransactions.items[0];

  beforeEach(() => {
    wrapper = render(loan);
  });

  it('should render bankReferenceNumber', () => {
    wrapper.expectText('[data-cy="bank-reference-number"]').toRead(loan.bankReferenceNumber);
  });

  it('should render facilityStage', () => {
    wrapper.expectText('[data-cy="facility-stage"]').toRead(loan.facilityStage);
  });

  it('should render ukefGuaranteeInMonths', () => {
    wrapper.expectText('[data-cy="ukef-guarantee-length-in-months"]').toRead(loan.ukefGuaranteeInMonths);
  });

  it('should render requestedCoverStartDate', () => {
    const expected = `${loan['requestedCoverStartDate-day']}/${loan['requestedCoverStartDate-month']}/${loan['requestedCoverStartDate-year']}`;
    wrapper.expectText('[data-cy="requested-cover-start-date"]').toRead(expected);
  });

  it('should render coverEndDate', () => {
    const expected = `${loan['coverEndDate-day']}/${loan['coverEndDate-month']}/${loan['coverEndDate-year']}`;
    wrapper.expectText('[data-cy="cover-end-date"]').toRead(expected);
  });

  it('should render facilityValue', () => {
    wrapper.expectText('[data-cy="facility-value"]').toRead(loan.facilityValue);
  });

  describe('currencySameAsSupplyContractCurrency', () => {
    const selector = '[data-cy="currency-same-as-supply-contract-currency"]';

    it('should render `Yes` when value is `true`', () => {
      wrapper = render({
        ...loan,
        currencySameAsSupplyContractCurrency: 'true',
      });
      wrapper.expectText(selector).toRead('Yes');
    });

    it('should render `No` when value is false', () => {
      wrapper = render({
        ...loan,
        currencySameAsSupplyContractCurrency: 'false',
      });
      wrapper.expectText(selector).toRead('No');
    });
  });

  it('should render currency', () => {
    wrapper.expectText('[data-cy="currency"]').toRead(loan.currency.text);
  });

  it('should render conversionRate', () => {
    wrapper.expectText('[data-cy="conversion-rate"]').toRead(loan.conversionRate);
  });

  it('should render conversionRateDate', () => {
    const expected = `${loan['conversionRateDate-day']}/${loan['conversionRateDate-month']}/${loan['conversionRateDate-year']}`;
    wrapper.expectText('[data-cy="conversion-rate-date"]').toRead(expected);
  });

  it('should render disbursementAmount', () => {
    wrapper.expectText('[data-cy="disbursement-amount"]').toRead(loan.disbursementAmount);
  });

  it('should render interestMarginFee', () => {
    wrapper.expectText('[data-cy="interest-margin-fee"]').toRead(`${loan.interestMarginFee}%`);
  });

  it('should render coveredPercentage', () => {
    wrapper.expectText('[data-cy="covered-percentage"]').toRead(`${loan.coveredPercentage}%`);
  });

  it('should render minimumQuarterlyFee', () => {
    wrapper.expectText('[data-cy="minimum-quarterly-fee"]').toRead(loan.minimumQuarterlyFee);
  });

  it('should render guaranteeFeePayableByBank', () => {
    wrapper.expectText('[data-cy="guarantee-fee-payable-by-bank"]').toRead(loan.guaranteeFeePayableByBank);
  });

  it('should render ukefExposure', () => {
    wrapper.expectText('[data-cy="ukef-exposure"]').toRead(loan.ukefExposure);
  });

  it('should render premiumType', () => {
    wrapper.expectText('[data-cy="premium-type"]').toRead(loan.premiumType);
  });

  it('should render premiumFrequency', () => {
    wrapper.expectText('[data-cy="premium-frequency"]').toRead(loan.premiumFrequency);
  });

  it('should render dayCountBasis', () => {
    wrapper.expectText('[data-cy="day-count-basis"]').toRead(loan.dayCountBasis);
  });
});
