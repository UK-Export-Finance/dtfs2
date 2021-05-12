const componentRenderer = require('../../../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/pricing-and-risk/_macros/section-exporter/exporter-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const defaultParams = {
    caseId: '1234',
    exporterCreditRating: 'Good (BB-)',
    userCanEdit: false,
    lossGivenDefault: '50',
    probabilityOfDefault: '14.1',
  };

  describe('credit rating', () => {
    it('should render table cell heading', () => {
      wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="exporter-table-credit-rating-heading"]').toRead('Credit rating');
    });

    it('should render value', () => {
      wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="exporter-table-credit-rating-value"]').toRead(defaultParams.exporterCreditRating);
    });

    describe('when there is no credit rating', () => {
      it('should render `Not added` govukTag', () => {
        const params = {
          ...defaultParams,
          exporterCreditRating: null,
        };

        wrapper = render(params);

        wrapper.expectElement('[data-cy="exporter-table-credit-rating-value"]').notToExist();
        wrapper.expectElement('[data-cy="exporter-table-credit-rating-not-added"]').toExist();
        wrapper.expectText('[data-cy="exporter-table-credit-rating-not-added"]').toRead('Not added');
      });
    });

    it('should NOT render `Change` link by default', () => {
      wrapper = render(defaultParams);

      wrapper.expectElement('[data-cy="exorter-table-change-credit-rating-link"]').notToExist();
    });

    describe('with params.exporterCreditRating and params.userCanEdit', () => {
      it('should render `Change` link', () => {
        const params = {
          ...defaultParams,
          userCanEdit: true,
          exporterCreditRating: 'Good (BB-)',
        };

        wrapper = render(params);

        wrapper.expectLink('[data-cy="exporter-table-change-credit-rating-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/edit`, 'Change');

        wrapper.expectLink('[data-cy="exporter-table-change-loss-given-default-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/loss-given-default`, 'Change');

        wrapper.expectLink('[data-cy="exporter-table-change-probability-of-default-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/probability-of-default`, 'Change');
      });
    });
  });

  describe('loss given default', () => {
    it('should render table cell heading', () => {
      wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="exporter-table-loss-given-default-heading"]').toRead('Loss given default');
    });

    it('should render value', () => {
      wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="exporter-table-loss-given-default-value"]').toRead(`${defaultParams.lossGivenDefault}%`);
    });
  });

  describe('probability of default', () => {
    it('should render table cell heading', () => {
      wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="exporter-table-probability-of-default-heading"]').toRead('Probability of default');
    });

    it('should render value', () => {
      wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="exporter-table-probability-of-default-value"]')
        .toRead(`Less than ${defaultParams.probabilityOfDefault}%`);
    });
  });
});
