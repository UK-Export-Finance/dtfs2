const componentRenderer = require('../../../../../component-tests/componentRenderer');
const component = '../templates/case/underwriting/managers-decision/_macros/managers-decision-form.njk'

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    caseId: '1234',
  };

  describe('radio buttons', () => {
    it('should render `Approve without conditions` radio button', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="approve-without-conditions-radio-button"]').toExist();
    });

    it('should render `Approve with conditions` radio button', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="approve-with-conditions-radio-button"]').toExist();
    });

    it('should render `Decline` radio button', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="decline-radio-button"]').toExist();
    });
  });

  it('should render internalComments input', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="internalComments-input"]').toExist();
  });

  it('should render submit button', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="submit-button"]').toExist();
    wrapper.expectText('[data-cy="submit-button"]').toRead('Save');
  });

  it('should render cancel link', () => {
    const wrapper = render(params);
    wrapper.expectLink('[data-cy="cancel-link"]')
      .toLinkTo(
        `/case/${params.caseId}/underwriting/pricing-and-risk`,
        'Cancel',
      );
  });
});
