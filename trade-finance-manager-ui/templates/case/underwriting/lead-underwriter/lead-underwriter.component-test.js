const pageRenderer = require('../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/lead-underwriter/lead-underwriter.njk';

const render = pageRenderer(page);

describe(page, () => {
  const params = {
    dealId: '1234',
  };

  it('should render heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="underwriting-heading"]').toRead('Underwriting');
  });

  it('should render Lead Underwriter heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="lead-underwriter-heading"]').toRead('Lead Underwriter');
  });

  it('should render `assign` link', () => {
    const wrapper = render(params);
    wrapper.expectLink('[data-cy="assign-lead-underwriter-link"]').toLinkTo(
      `/case/${params.dealId}/underwriting/lead-underwriter/assign`,
      'Assign a lead underwriter',
    );
  });
});
