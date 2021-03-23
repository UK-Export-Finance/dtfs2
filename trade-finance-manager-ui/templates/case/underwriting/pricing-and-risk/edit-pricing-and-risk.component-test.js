const pageRenderer = require('../../../../component-tests/pageRenderer');
const page = '../templates/case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    dealId: '1234',
    deal: {
      submissionDetails: {
        supplierName: 'The Supplier Name',
      },
    },
  };

  // TODO: legend text

  describe('radio buttons', () => {
    it('should render `Good` radio button', () => {
      const wrapper = render(params);
      wrapper.expectInput('[data-cy="credit-rating-good"]').toHaveValue('Good (BB-)');
    });

    it('should render `Acceptable (B+)` radio button', () => {
      const wrapper = render(params);
      wrapper.expectInput('[data-cy="credit-rating-acceptable"]').toHaveValue('Acceptable (B+)');
    });

    it('should render `Other` radio button', () => {
      const wrapper = render(params);
      wrapper.expectInput('[data-cy="credit-rating-other"]').toHaveValue('Other');
    });
  });
});
