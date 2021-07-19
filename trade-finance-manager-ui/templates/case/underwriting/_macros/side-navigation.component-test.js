const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/_macros/side-navigation.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  it('should render 4 links', () => {
    const params = {
      caseId: '1234',
    };

    wrapper = render(params);

    wrapper.expectLink('[data-cy="lead-underwriter"] a')
      .toLinkTo(`/case/${params.caseId}/underwriting/lead-underwriter`, 'Lead underwriter');

    wrapper.expectLink('[data-cy="bank-security"] a')
      .toLinkTo(`/case/${params.caseId}/underwriting/bank-security`, 'Bank security');

    wrapper.expectLink('[data-cy="pricing-and-risk"] a')
      .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk`, 'Pricing and risk');

    wrapper.expectLink('[data-cy="underwriter-managers-decision"] a')
      .toLinkTo(`/case/${params.caseId}/underwriting/managers-decision`, 'Underwriter manager’s decision');
  });
});
