const { pageRenderer } = require('../../pageRenderer');

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

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('radio buttons', () => {
    it('should render `Good` radio button', () => {
      wrapper.expectInput('[data-cy="credit-rating-good"]').toHaveValue('Good (BB-)');
    });

    it('should render `Acceptable (B+)` radio button', () => {
      wrapper.expectInput('[data-cy="credit-rating-acceptable"]').toHaveValue('Acceptable (B+)');
    });

    it('should render `Other` radio button', () => {
      wrapper.expectInput('[data-cy="credit-rating-other"]').toHaveValue('Other');
    });
  });

  describe('accessible autocomplete select', () => {
    beforeEach(() => {
      wrapper = render({
        ...params,
        tfm: {
          exporterCreditRating: 'A+',
        },
        creditRatings: [
          {
            value: '',
            text: '',
          },
          {
            value: 'A+',
            text: 'A+',
            selected: true,
          },
          {
            value: 'BBB',
            text: 'BBB',
          },
        ],
      });
    });

    it('should render `Other` accessible autocomplete select', () => {
      wrapper.expectElement('#exporterCreditRatingOther[name="exporterCreditRatingOther"]').toExist();
      wrapper.expectElement('#exporterCreditRatingOther option[value="A+"][selected]').toExist();
    });

    it('should render accessible autocomplete script', () => {
      wrapper.expectElement('script[src="/assets/js/accessibleAutocomplete.js"]').toExist();
    });
  });
});
