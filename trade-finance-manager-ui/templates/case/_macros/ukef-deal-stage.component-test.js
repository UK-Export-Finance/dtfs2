const fs = require('fs');
const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/case/_macros/ukef-deal-stage.njk';
const render = componentRenderer(component);

const params = {
  stage: 'Confirmed',
};

describe(component, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render UKEF deal stage', () => {
    wrapper.expectText('[data-cy="ukef-deal-stage-value"]').toRead(params.stage);
  });
});
