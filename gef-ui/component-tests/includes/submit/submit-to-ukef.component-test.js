const pageRenderer = require('../../pageRenderer');

const page = 'includes/submit/submit-to-ukef.njk';
const render = pageRenderer(page);

const dealId = 'deal-1';
const facilityId = 'facility-1';
const amendmentId = 'amendment-1';

describe(page, () => {
  describe('submit heading', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({ dealId });
    });

    it('should render the submit heading as an h2', () => {
      wrapper.expectElement('h2[data-cy="submit-heading"]').toExist();
    });

    it('should render the submit heading with the heading-l class', () => {
      wrapper.expectElement('h2[data-cy="submit-heading"]').hasClass('govuk-heading-l');
    });

    it('should render the submit heading text', () => {
      wrapper.expectText('[data-cy="submit-heading"]').toRead('Submit or return');
    });
  });

  describe('when rendered for a deal submission', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({ dealId });
    });

    it('should render the deal submission message', () => {
      wrapper.expectText('.govuk-body').toRead('If this is ready, you can submit it to UKEF. Or you can return it to the maker to make changes.');
    });

    it('should render the submit button linking to the deal submit page', () => {
      wrapper.expectElement('[data-cy="submit-button"]').toExist();
      wrapper.expectElement('[data-cy="submit-button"]').toHaveAttribute('href', `${dealId}/submit-to-ukef`);
    });

    it('should render the return to maker button linking to the deal return page', () => {
      wrapper.expectElement('[data-cy="return-button"]').toExist();
      wrapper.expectElement('[data-cy="return-button"]').toHaveAttribute('href', `${dealId}/return-to-maker`);
    });
  });

  describe('when rendered for an amendment submission', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({ dealId, facilityId, amendmentId, submitAmendment: true });
    });

    it('should render the amendment submission message', () => {
      wrapper.expectText('.govuk-body').toRead('Submit to UKEF or return to maker for changes');
    });

    it('should render the submit button linking to the amendment submit page', () => {
      const expectedHref = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;

      wrapper.expectElement('[data-cy="submit-button"]').toHaveAttribute('href', expectedHref);
    });

    it('should render the return to maker button linking to the amendment return page', () => {
      const expectedHref = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/return-to-maker`;

      wrapper.expectElement('[data-cy="return-button"]').toHaveAttribute('href', expectedHref);
    });
  });
});
