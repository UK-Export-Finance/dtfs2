const componentRenderer = require('../../componentRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'contract/components/summary-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(deal);
  });

  it('should render deal currency', () => {
    wrapper.expectText('[data-cy="deal-currency"]').toRead(deal.submissionDetails.supplyContractCurrency.id);
  });

  it('should render number of bonds', () => {
    const expected = String(deal.bonds.length);
    wrapper.expectText('[data-cy="number-of-bonds"]').toRead(expected);
  });

  it('should render number of loans', () => {
    const expected = String(deal.loans.length);
    wrapper.expectText('[data-cy="number-of-loans"]').toRead(expected);
  });

  it('should render total number of transactions (bonds and loans)', () => {
    const expected = String(deal.bonds.length + deal.loans.length);
    wrapper.expectText('[data-cy="number-of-transactions"]').toRead(expected);
  });
});
