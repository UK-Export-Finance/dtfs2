const pageRenderer = require('../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/managers-decision/managers-decision.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  it('should render heading', () => {
    const wrapper = render();
    wrapper.expectText('[data-cy="managers-decision-heading"]').toRead('Underwriter manager’s decision');
  });

  describe('with params.tfm.underwriterManagersDecision.decision', () => {
    const params = {
      ...params,
      tfm: {
        underwriterManagersDecision: {
          decision: 'Declined',
        },
      },
    };


    it('should render managers-decision-submitted component', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="managers-decision-submitted"]').toExist();
    });

    it('should NOT render link to edit form', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="add-decision-link"]').notToExist();
    });
  });

  describe('with NO params.tfm.underwriterManagersDecision.decision and params.userCanEdit', () => {
    const params = {
      ...params,
      tfm: {},
      userCanEdit: true,
    };

    it('should NOT render managers-decision-submitted component', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="managers-decision-submitted"]').notToExist();
    });

    it('should render link to edit form', () => {
      const wrapper = render(params);
      wrapper.expectElement('[data-cy="add-decision-link"]').toExist();
    });
  });
});
