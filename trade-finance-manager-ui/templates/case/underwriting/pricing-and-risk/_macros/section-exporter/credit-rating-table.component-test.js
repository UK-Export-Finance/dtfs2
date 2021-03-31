const componentRenderer = require('../../../../../../component-tests/componentRenderer');
const component = '../templates/case/underwriting/pricing-and-risk/_macros/section-exporter/credit-rating-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    caseId: '1234',
    exporterCreditRating: 'Good (BB-)',
    userCanEdit: false,
  };

  it('should render `Credit rating` table cell heading', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="credit-rating-table-heading"]').toRead('Credit rating');
  });

  it('should render credit rating value', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="credit-rating-table-rating-value"]').toRead(params.exporterCreditRating);
  });

  describe('when there is no credit rating', () => {
    it('should render `Not added` govukTag', () => {
      params = {
        ...params,
        exporterCreditRating: null,
      };

      wrapper = render(params);

      wrapper.expectElement('[data-cy="credit-rating-table-rating-value"]').notToExist();
      wrapper.expectElement('[data-cy="credit-rating-table-rating-not-set"]').toExist();
      wrapper.expectText('[data-cy="credit-rating-table-rating-not-set"]').toRead('Not added');
    });
  });

  it('should NOT render `Change` link by default', () => {
    wrapper = render(params);

    wrapper.expectElement('[data-cy="credit-rating-table-change-link"]').notToExist();
  });

  describe('with params.exporterCreditRating and params.userCanEdit', () => {
    it('should render `Change` link', () => {
      params = {
        ...params,
        userCanEdit: true,
        exporterCreditRating: 'Good (BB-)',
      };

      wrapper = render(params);

      wrapper.expectLink('[data-cy="credit-rating-table-change-link"]')
      .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/edit`, 'Change');
    });
  });
});
