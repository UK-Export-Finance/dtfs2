const pageRenderer = require('../../../../component-tests/pageRenderer');
const page = '../templates/case/underwriting/managers-decision/managers-decision.njk'

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  let params = {
    dealId: '1234',
    deal: {},
  };

  it('should render heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="managers-decision-heading"]').toRead('Underwriter manager’s decision');
  });

  it('should render `decision form` component', () => {
    params = {
      ...params,
    };

    const wrapper = render(params);

    wrapper.expectElement('[data-cy="managers-decision-form"]').toExist();
    wrapper.expectElement('[data-cy="managers-decision-submitted"]').notToExist();
  });
});
