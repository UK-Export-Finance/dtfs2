const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/case/_macros/ukef-deal-stage.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  it('should render UKEF deal stage', () => {
    const params = {
      stage: 'Confirmed',
    };

    wrapper = render(params);

    wrapper.expectText('[data-cy="ukef-deal-stage-value"]').toRead(params.stage);
  });
});
