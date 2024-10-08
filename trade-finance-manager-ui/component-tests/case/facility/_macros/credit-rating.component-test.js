const { componentRenderer } = require('../../../componentRenderer');

const component = '../templates/case/facility/_macros/credit-rating.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('with params.creditRating', () => {
    it('should render creditRating', () => {
      const params = { creditRating: 'Good (BB-)' };
      wrapper = render(params);

      wrapper.expectText('[data-cy="credit-rating-value"]').toRead(params.creditRating);
      wrapper.expectElement('[data-cy="credit-rating-not-set-tag"]').notToExist();
    });
  });

  describe('without params.creditRating', () => {
    it('should render `not set` tag`', () => {
      wrapper = render({});

      wrapper.expectElement('[data-cy="credit-rating-not-set-tag"]').toExist();
      wrapper.expectElement('[data-cy="credit-rating-value"]').notToExist();
    });
  });
});
