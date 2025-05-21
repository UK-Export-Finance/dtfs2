import pageRenderer from '../../pageRenderer';

const page = 'includes/application-preview/application-sub-navigation.njk';
const render = pageRenderer(page);

const dealId = '6597dffeb5ef5ff4267e5044';

describe(page, () => {
  const params = {
    activeSubNavigation: '/',
    dealId,
  };

  it('should render the sub navigation with active the Application/Notice tab', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="application-preview-link"]').toExist();
  });

  it('should render the sub navigation with active the Amendments tab', () => {
    params.activeSubNavigation = 'amendments';
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="application-amendments-link"]').toExist();
  });

  it('should render the sub navigation with active the Activities tab', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="application-activities-link"]').toExist();
  });
});
