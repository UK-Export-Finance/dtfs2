const componentRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/underwriting/managers-decision/managers-decision.njk';

const render = componentRenderer(page);

describe(page, () => {
  let wrapper;

  describe('with params.tfm.underwriterManagersDecision.decision', () => {
    const params = {
      underwriterManagersDecision: {
        tfm: {
          underwriterManagersDecision: {
            decision: 'Declined',
          },
        },
      },
    };

    it('should render managers-decision-submitted component', () => {
      wrapper = render(params);
      wrapper.expectElement('[data-cy="managers-decision-submitted"]').toExist();
    });

    it('should NOT render link to edit form', () => {
      wrapper = render(params);
      wrapper.expectElement('[data-cy="add-decision-link"]').notToExist();
    });
  });

  describe('with NO params.tfm.underwriterManagersDecision.decision and params.userCanEdit', () => {
    const params = {
      underwriterManagersDecision: {
        dealId: '1234',
        tfm: {},
        userCanEdit: true,
      },
    };

    it('should NOT render managers-decision-submitted component', () => {
      wrapper = render(params);
      wrapper.expectElement('[data-cy="managers-decision-submitted"]').notToExist();
    });

    it('should render link to edit form', () => {
      wrapper = render(params);
      wrapper.expectLink('[data-cy="add-decision-link"]').toLinkTo(
        `/case/${params.underwriterManagersDecision.dealId}/underwriting/managers-decision/edit`,
        'Add decision',
      );
    });
  });

  describe('with NO params.tfm.underwriterManagersDecision.decision and params.userCanEdit as false', () => {
    const params = {
      underwriterManagersDecision: {
        dealId: '1234',
        tfm: {},
        userCanEdit: false,
      },
    };

    it('should NOT render managers-decision-submitted component', () => {
      wrapper = render(params);
      wrapper.expectElement('[data-cy="managers-decision-submitted"]').notToExist();
    });

    it('should render text saying no decision yet', () => {
      wrapper = render(params);
      wrapper.expectText('[data-cy="decision-not-added-readonly"]').toRead('Not added yet');
    });
  });
});
