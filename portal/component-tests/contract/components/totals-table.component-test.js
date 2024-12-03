const componentRenderer = require('../../componentRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'contract/components/totals-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(deal.summary);
  });

  describe('Total value row', () => {
    it('should render dealCurrency', () => {
      wrapper.expectText('[data-cy="total-value"] [data-cy="deal-in-deal-currency"]').toRead(deal.summary.totalValue.dealInDealCurrency);
    });

    it('should render dealInGbp', () => {
      wrapper.expectText('[data-cy="total-value"] [data-cy="deal-in-gbp"]').toRead(deal.summary.totalValue.dealInGbp);
    });

    it('should render bondsInDealCurrency', () => {
      wrapper.expectText('[data-cy="total-value"] [data-cy="bonds-in-deal-currency"]').toRead(deal.summary.totalValue.bondsInDealCurrency);
    });

    it('should render bondsInGbp', () => {
      wrapper.expectText('[data-cy="total-value"] [data-cy="bonds-in-gbp"]').toRead(deal.summary.totalValue.bondsInGbp);
    });

    it('should render loansInDealCurrency', () => {
      wrapper.expectText('[data-cy="total-value"] [data-cy="loans-in-deal-currency"]').toRead(deal.summary.totalValue.loansInDealCurrency);
    });

    it('should render loansInGbp', () => {
      wrapper.expectText('[data-cy="total-value"] [data-cy="loans-in-gbp"]').toRead(deal.summary.totalValue.loansInGbp);
    });
  });

  describe('Total UKEF exposure row', () => {
    it('should render dealCurrency', () => {
      wrapper.expectText('[data-cy="total-ukef-exposure"] [data-cy="deal-in-deal-currency"]').toRead(deal.summary.totalUkefExposure.dealInDealCurrency);
    });

    it('should render dealInGbp', () => {
      wrapper.expectText('[data-cy="total-ukef-exposure"] [data-cy="deal-in-gbp"]').toRead(deal.summary.totalUkefExposure.dealInGbp);
    });

    it('should render bondsInDealCurrency', () => {
      wrapper.expectText('[data-cy="total-ukef-exposure"] [data-cy="bonds-in-deal-currency"]').toRead(deal.summary.totalUkefExposure.bondsInDealCurrency);
    });

    it('should render bondsInGbp', () => {
      wrapper.expectText('[data-cy="total-ukef-exposure"] [data-cy="bonds-in-gbp"]').toRead(deal.summary.totalUkefExposure.bondsInGbp);
    });

    it('should render loansInDealCurrency', () => {
      wrapper.expectText('[data-cy="total-ukef-exposure"] [data-cy="loans-in-deal-currency"]').toRead(deal.summary.totalUkefExposure.loansInDealCurrency);
    });

    it('should render loansInGbp', () => {
      wrapper.expectText('[data-cy="total-ukef-exposure"] [data-cy="loans-in-gbp"]').toRead(deal.summary.totalUkefExposure.loansInGbp);
    });
  });
});
