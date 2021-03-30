const componentRenderer = require('../../../../../../component-tests/componentRenderer');
const component = '../templates/case/underwriting/pricing-and-risk/_macros/section-exporter/section-exporter.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    caseId: '1234',
    supplierName: 'Testing',
  };

  it('should render Exporter heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="exporter-heading"]').toRead('Exporter');
  });

  it('should render link to add credit rating', () => {
    const wrapper = render(params);
    wrapper.expectLink('[data-cy="add-credit-rating-link"]')
      .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/edit`, `Add a credit rating for ${params.supplierName}`);
  });

  describe('with params.exporterCreditRating', () => {
    it('should NOT render link to add credit rating', () => {
      params = {
        ...params,
        exporterCreditRating: 'Good (BB-)',
      };

      const wrapper = render(params);
      wrapper.expectElement('[data-cy="add-credit-rating-link"]').notToExist();
    });

    it('should render credit rating table', () => {
      params = {
        ...params,
        exporterCreditRating: 'Good (BB-)',
      };

      const wrapper = render(params);
      wrapper.expectElement('[data-cy="credit-rating-table"]').toExist();
    });
  });


});
