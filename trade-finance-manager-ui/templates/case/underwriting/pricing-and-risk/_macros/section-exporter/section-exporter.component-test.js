const componentRenderer = require('../../../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/pricing-and-risk/_macros/section-exporter/section-exporter.njk';

const render = componentRenderer(component);

describe(component, () => {
  let params = {
    caseId: '1234',
    supplierName: 'Testing',
    userCanEdit: false,
  };

  it('should render Exporter heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="exporter-heading"]').toRead('Exporter');
  });

  it('should NOT render link to add credit rating', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="add-credit-rating-link"]').notToExist();
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

    it('should render exporter table', () => {
      params = {
        ...params,
        exporterCreditRating: 'Good (BB-)',
      };

      const wrapper = render(params);
      wrapper.expectElement('[data-cy="exporter-table"]').toExist();
    });
  });

  describe('with no params.exporterCreditRating and params.userCanEditGeneral is true', () => {
    it('should render link to add credit rating', () => {
      params = {
        ...params,
        exporterCreditRating: null,
        userCanEditGeneral: true,
      };

      const wrapper = render(params);
      wrapper.expectLink('[data-cy="add-credit-rating-link"]')
        .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/edit`, 'Add');
    });
  });
});
