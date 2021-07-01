const pageRenderer = require('../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/lead-underwriter/assign-lead-underwriter.njk';

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
    wrapper.expectText('[data-cy="assign-lead-underwriter-heading"]').toRead('Assign a lead underwriter');
  });


  describe('form', () => {
    it('should render `assigned to` select input', () => {
      wrapper.expectElement('[data-cy="assigned-to-select-input"]').toExist();
    });

    it('should render submit button', () => {
      wrapper.expectElement('[data-cy="submit-button"]').toExist();
      wrapper.expectText('[data-cy="submit-button"]').toRead('Save');
    });

    it('should render `cancel` link', () => {
      wrapper.expectLink('[data-cy="cancel-link"]').toLinkTo(
        `/case/${params.dealId}/underwriting/lead-underwriter`,
        'Cancel',
      );
    });
  });
});
