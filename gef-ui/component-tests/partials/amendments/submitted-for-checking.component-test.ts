import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/submitted-for-checking.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the confirmation panel', () => {
    const wrapper = render();

    wrapper.expectText('[data-cy="submitted-for-checking-confirmation-panel"]').toContain('Amendment submitted for checking at your bank');
  });

  it(`should render the return link`, () => {
    const wrapper = render();

    wrapper.expectLink('[data-cy="return-link"]').toLinkTo('/dashboard/deals', 'Return to all applications and notices');
  });
});
