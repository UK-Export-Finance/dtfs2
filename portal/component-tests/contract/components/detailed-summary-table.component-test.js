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
      wrapper.expectText('[data-cy="deal-in-deal-currency"]').toRead(deal.summary.totalValue.dealInDealCurrency);
    });

    it('should render dealInGbp', () => {
      wrapper.expectText('[data-cy="deal-in-gbp"]').toRead(deal.summary.totalValue.dealInGbp);
    });

    it('should render bondCurrency', () => {
      wrapper.expectText('[data-cy="bond-in-deal-currency"]').toRead(deal.summary.totalValue.bondInDealCurrency);
    });

    it('should render bondInGbp', () => {
      wrapper.expectText('[data-cy="bond-in-gbp"]').toRead(deal.summary.totalValue.bondInGbp);
    });

    it('should render loanCurrency', () => {
      wrapper.expectText('[data-cy="loan-in-deal-currency"]').toRead(deal.summary.totalValue.loanInDealCurrency);
    });

    it('should render loanInGbp', () => {
      wrapper.expectText('[data-cy="loan-in-gbp"]').toRead(deal.summary.totalValue.loanInGbp);
    });
  });
});
