const pageRenderer = require('../../../../component-tests/pageRenderer');
const page = '../templates/case/underwriting/managers-decision/managers-decision.njk'

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  let params = {
    dealId: '1234',
    deal: {
    }
  };

  it('should render heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="managers-decision-heading"]').toRead('Underwriter manager’s decision');
  });

  describe('radio buttons', () => {
    it('should render `Approve without conditions` radio button', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="approve-without-conditions-radio-button"]').toExist();
    });

    it('should render `Approve with conditions` radio button', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="approve-with-conditions-radio-button"]').toExist();
    });

    it('should render `Decline` radio button', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="decline-radio-button"]').toExist();
    });
  });

  it('should render internalComments input', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="internal-comments-input"]').toExist();
  });

  it('should render submit button', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="submit-button"]').toExist();
    wrapper.expectText('[data-cy="submit-button"]').toRead('Save');
  });

  it('should render cancel link', () => {
    const wrapper = render(params);
    wrapper.expectLink('[data-cy="cancel-link"]')
      .toLinkTo(
        `/case/${params.dealId}/underwriting/pricing-and-risk`,
        'Cancel',
      );
  });
});
