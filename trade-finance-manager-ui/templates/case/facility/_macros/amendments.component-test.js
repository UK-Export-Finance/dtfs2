const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/facility/_macros/amendments.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('with params.showAmendmentButton', () => {
    it('should render add amendment button if showAmendmentButton is true', () => {
      const params = { showAmendmentButton: true };
      wrapper = render(params);

      wrapper.expectElement('[data-cy="add-amendment-button"]').toExist();
    });

    it('should render add amendment button if showAmendmentButton is false', () => {
      const params = { showAmendmentButton: false };
      wrapper = render(params);

      wrapper.expectElement('[data-cy="add-amendment-button"]').notToExist();
    });
  });
});
