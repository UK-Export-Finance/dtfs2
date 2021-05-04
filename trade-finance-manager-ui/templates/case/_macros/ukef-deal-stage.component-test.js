const fs = require('fs');
const componentRenderer = require('../../../component-tests/componentRenderer');

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

  describe('when params.text is `Approved with conditions`', () => {
    it('should render modified text', () => {
      const params = {
        stage: 'Approved with conditions',
      };

      wrapper = render(params);

      const expected = 'Approved (with conditions)';

      wrapper.expectText('[data-cy="ukef-deal-stage-value"]').toRead(expected);
    });
  });

  describe('when params.text is `Approved without conditions`', () => {
    it('should render modified text', () => {
      const params = {
        stage: 'Approved without conditions',
      };

      wrapper = render(params);

      const expected = 'Approved (no conditions)';

      wrapper.expectText('[data-cy="ukef-deal-stage-value"]').toRead(expected);
    });
  });
});
