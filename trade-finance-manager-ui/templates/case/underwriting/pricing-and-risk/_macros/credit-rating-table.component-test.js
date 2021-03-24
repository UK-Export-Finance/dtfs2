const componentRenderer = require('../../../../../component-tests/componentRenderer');
const component = '../templates/case/underwriting/pricing-and-risk/_macros/credit-rating-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    caseId: '1234',
    exporterCreditRating: 'Good (BB-)',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render `Credit rating` table cell heading', () => {
    wrapper.expectText('[data-cy="credit-rating-table-heading"]').toRead('Credit rating');
  });

  it('should render credit rating value', () => {
    wrapper.expectText('[data-cy="credit-rating-table-rating-value"]').toRead(params.exporterCreditRating);
  });

  it('should render `Change` link', () => {
    wrapper.expectLink('[data-cy="credit-rating-table-change-link"]')
      .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/edit`, 'Change');
  });
});
