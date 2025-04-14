import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/submitted-page.njk';
const render = pageRenderer(page);

describe(page, () => {
  describe('submittedToChecker is true', () => {
    const params = {
      submittedToChecker: true,
    };

    it('should render the confirmation panel', () => {
      const wrapper = render(params);

      wrapper.expectText('[data-cy="submitted-for-checking-confirmation-panel"]').toContain('Amendment submitted for checking at your bank');
    });

    it(`should render the return link`, () => {
      const wrapper = render(params);

      wrapper.expectLink('[data-cy="return-link"]').toLinkTo('/dashboard/deals', 'Return to all applications and notices');
    });
  });

  describe('approvedByUkef is true', () => {
    const params = {
      approvedByUkef: true,
      effectiveDate: '1 January 2023',
      referenceNumber: '0041550077-01',
    };

    it('should render the confirmation panel', () => {
      const wrapper = render(params);

      wrapper.expectText('[data-cy="approved-by-ukef-confirmation-panel"]').toContain('Amendment approved by UKEF');
      wrapper.expectText('[data-cy="amendment-reference"]').toRead(`Amendment reference is ${params.referenceNumber}`);
      wrapper.expectText('[data-cy="confirmation-email"]').toRead("We've sent you a confirmation email.");
    });

    it('should render a what happens next section', () => {
      const wrapper = render(params);

      wrapper.expectText('[data-cy="heading"]').toRead('What happens next?');
      wrapper
        .expectText('[data-cy="approved-amendments-effective-date"]')
        .toRead(`We have approved your amendments and they will take effect from ${params.effectiveDate}`);
    });

    it(`should render the return link`, () => {
      const wrapper = render(params);

      wrapper.expectLink('[data-cy="return-link"]').toLinkTo('/dashboard/deals', 'Return to all applications and notices');
    });
  });
});
