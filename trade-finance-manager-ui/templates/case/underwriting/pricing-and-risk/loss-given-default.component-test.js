const pageRenderer = require('../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/pricing-and-risk/loss-given-default.njk';

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
    tfm: {
      lossGivenDefault: '50',
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('loss given default', () => {
    it('should render page label heading', () => {
      wrapper.expectText('[data-cy="label-heading"]').toRead(
        `What’s the loss given default (LGD) for ${params.deal.submissionDetails.supplierName}`,
      );
    });

    it('should render loss given default input', () => {
      wrapper.expectInput('[data-cy="input-loss-given-default"]').toHaveValue(params.tfm.lossGivenDefault);
    });

    it('should render save & close buttons', () => {
      wrapper.expectElement('[data-cy="submit-button"]').toExist();
      wrapper.expectLink('[data-cy="close-link"]')
        .toLinkTo(`/case/${params.dealId}/underwriting`, 'Cancel');
    });
  });
});
