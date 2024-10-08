const { componentRenderer } = require('../../../../../../componentRenderer');

const component = '../templates/case/underwriting/pricing-and-risk/_macros/section-exporter/exporter-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const defaultParams = {
    caseId: '1234',
    exporterCreditRating: 'Good (BB-)',
    userCanEditGeneral: false,
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

      wrapper.expectElement('[data-cy="exporter-table-credit-rating-action-link"]').notToExist();
    });

    describe('with params.userCanEditGeneral but no params.exporterCreditRating', () => {
      it('should render `Add` link', () => {
        const params = {
          ...defaultParams,
          userCanEditGeneral: true,
          exporterCreditRating: undefined,
        };

        wrapper = render(params);

        wrapper
          .expectLink('[data-cy="exporter-table-credit-rating-action-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/edit`, 'Add credit rating');
      });
    });

    describe('with params.exporterCreditRating and params.userCanEditGeneral', () => {
      it('should render `Change` link', () => {
        const params = {
          ...defaultParams,
          userCanEditGeneral: true,
          exporterCreditRating: 'Good (BB-)',
        };

        wrapper = render(params);

        wrapper
          .expectLink('[data-cy="exporter-table-credit-rating-action-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/edit`, 'Change credit rating');
      });
    });

    describe('with params.userCanEditGeneral', () => {
      it('should render `Change` link', () => {
        const params = {
          ...defaultParams,
          userCanEditGeneral: true,
        };

        wrapper = render(params);

        wrapper
          .expectLink('[data-cy="exporter-table-change-loss-given-default-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/loss-given-default`, 'Change loss given default');

        wrapper
          .expectLink('[data-cy="exporter-table-change-probability-of-default-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/probability-of-default`, 'Change probability of default');
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

    describe('when there is no loss given default', () => {
      it('should render a dash', () => {
        wrapper = render({});

        wrapper.expectText('[data-cy="exporter-table-loss-given-default-value"]').toRead('-');
      });
    });

    it('should NOT render `Change` link by default', () => {
      wrapper = render(defaultParams);

      wrapper.expectElement('[data-cy="exporter-table-change-loss-given-default-link"]').notToExist();
    });

    describe('when user can edit', () => {
      it('should render a link to change link', () => {
        const params = {
          ...defaultParams,
          userCanEditGeneral: true,
        };

        wrapper = render(params);

        wrapper
          .expectLink('[data-cy="exporter-table-change-loss-given-default-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/loss-given-default`, 'Change loss given default');
      });
    });
  });

  describe('probability of default', () => {
    it('should render table cell heading', () => {
      wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="exporter-table-probability-of-default-heading"]').toRead('Probability of default');
    });

    it('should render value', () => {
      wrapper = render(defaultParams);

      wrapper.expectText('[data-cy="exporter-table-probability-of-default-value"]').toRead(`Less than ${defaultParams.probabilityOfDefault}%`);
    });

    describe('when there is no probability of default', () => {
      it('should render a dash', () => {
        wrapper = render({});

        wrapper.expectText('[data-cy="exporter-table-probability-of-default-value"]').toRead('-');
      });
    });

    it('should NOT render `Change` link by default', () => {
      wrapper = render(defaultParams);

      wrapper.expectElement('[data-cy="exporter-table-change-probability-of-default-link"]').notToExist();
    });

    describe('when user can edit', () => {
      it('should render change link', () => {
        const params = {
          ...defaultParams,
          userCanEditGeneral: true,
        };

        wrapper = render(params);

        wrapper
          .expectLink('[data-cy="exporter-table-change-probability-of-default-link"]')
          .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk/probability-of-default`, 'Change probability of default');
      });
    });
  });
});
