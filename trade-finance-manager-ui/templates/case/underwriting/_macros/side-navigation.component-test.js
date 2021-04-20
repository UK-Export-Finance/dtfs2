const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/pricing-and-risk/_macros/side-navigation.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  it('should rennder 3 links', () => {
    const params = {
      caseId: '1234',
    };

    wrapper = render(params);

    wrapper.expectLink('[data-cy="bank-security"] a')
      .toLinkTo(`/case/${params.caseId}/underwriting/bank-security`, 'Bank security');

    wrapper.expectLink('[data-cy="pricing-and-risk"] a')
      .toLinkTo(`/case/${params.caseId}/underwriting/pricing-and-risk`, 'Pricing and risk');

    wrapper.expectLink('[data-cy="underwriter-managers-decision"] a')
      .toLinkTo(`/case/${params.caseId}/underwriting/underwriter-managers-decision`, 'Underwriter manager’s decision');
  });
});
