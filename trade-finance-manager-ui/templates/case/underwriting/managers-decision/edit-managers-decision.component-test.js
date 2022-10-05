const pageRenderer = require('../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/managers-decision/edit-managers-decision.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    dealId: '1234',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectText('[data-cy="managers-decision-heading"]').toRead('Underwriter manager’s decision');
  });

  describe('form', () => {
    describe('radio buttons', () => {
      it('should render `Approve without conditions` radio button', () => {
        wrapper.expectElement('[data-cy="approve-without-conditions-radio-button"]').toExist();
      });

      it('should render `Approve with conditions` radio button', () => {
        wrapper.expectElement('[data-cy="approve-with-conditions-radio-button"]').toExist();
      });

      it('should render `Decline` radio button', () => {
        wrapper.expectElement('[data-cy="decline-radio-button"]').toExist();
      });
    });

    it('should render internalComments input', () => {
      wrapper.expectElement('[data-cy="internalComments-input"]').toExist();
    });

    it('should render submit button', () => {
      wrapper.expectElement('[data-cy="submit-button"]').toExist();
      wrapper.expectText('[data-cy="submit-button"]').toRead('Save');
    });

    it('should render cancel link', () => {
      wrapper.expectLink('[data-cy="cancel-link"]')
        .toLinkTo(
          `/case/${params.dealId}/underwriting`,
          'Cancel',
        );
    });
  });
});
