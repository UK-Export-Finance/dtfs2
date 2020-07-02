const componentRenderer = require('../../componentRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'contract/components/detailed-summary-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(deal.summary);
  });

  describe('totalValue row', () => {
    it('should render dealCurrency', () => {
      wrapper.expectText('[data-cy="deal-currency"]').toRead(deal.summary.totalValue.dealCurrency);
    });

    it('should render dealInGbp', () => {
      wrapper.expectText('[data-cy="deal-in-gbp"]').toRead(deal.summary.totalValue.dealInGbp);
    });

    it('should render bondCurrency', () => {
      wrapper.expectText('[data-cy="bond-currency"]').toRead(deal.summary.totalValue.bondCurrency);
    });

    it('should render bondInGbp', () => {
      wrapper.expectText('[data-cy="bond-in-gbp"]').toRead(deal.summary.totalValue.bondInGbp);
    });

    it('should render loanCurrency', () => {
      wrapper.expectText('[data-cy="loan-currency"]').toRead(deal.summary.totalValue.loanCurrency);
    });

    it('should render loanInGbp', () => {
      wrapper.expectText('[data-cy="loan-in-gbp"]').toRead(deal.summary.totalValue.loanInGbp);
    });
  });
});
