const pageRenderer = require('../../../../component-tests/pageRenderer');
const page = '../templates/case/underwriting/managers-decision/managers-decision.njk'

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  let params = {
    dealId: '1234',
    deal: {
    }
  };

  it('should render heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="managers-decision-heading"]').toRead('Underwriter manager’s decision');
  });

  describe('with params.decisionSubmitted',() => {
    it('should render `decision submitted` component', () => {
      params = {
        ...params,
        decisionSubmitted: true,
      };
      
      const wrapper = render(params);

      wrapper.expectElement('[data-cy="managers-decision-submitted"]').toExist();
      wrapper.expectElement('[data-cy="managers-decision-form"]').notToExist();
    });
  });

  describe('with NO params.decisionSubmitted', () => {
    it('should render `decision form` component', () => {
      params = {
        ...params,
        decisionSubmitted: false,
      };

      const wrapper = render(params);

      wrapper.expectElement('[data-cy="managers-decision-form"]').toExist();
      wrapper.expectElement('[data-cy="managers-decision-submitted"]').notToExist();
    });
  });
});
