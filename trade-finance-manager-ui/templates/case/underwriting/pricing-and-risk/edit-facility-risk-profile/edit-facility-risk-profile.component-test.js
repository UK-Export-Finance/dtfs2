const pageRenderer = require('../../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/pricing-and-risk/edit-facility-risk-profile/edit-facility-risk-profile.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    dealId: '1234',
    facility: {
      facilitySnapshot: {},
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render page heading', () => {
    const selector = '[data-cy="edit-facility-risk-profile-heading"]';

    wrapper.expectText(selector).toRead('What’s the risk profile for this facility?');
  });

  describe('form', () => {
    it('should render legend', () => {
      wrapper.expectElement('[data-cy="edit-facility-risk-profile-legend"]').toExist();
    });

    describe('radio buttons', () => {
      it('should render `Flat` radio button', () => {
        wrapper.expectElement('[data-cy="facility-risk-profile-input-flat"]').toExist();
      });

      it('should render `Variable` radio button', () => {
        wrapper.expectElement('[data-cy="facility-risk-profile-input-variable"]').toExist();
      });
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
