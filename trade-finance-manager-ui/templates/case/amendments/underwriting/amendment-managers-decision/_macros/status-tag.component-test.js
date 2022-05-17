const componentRenderer = require('../../../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/managers-decision/_macros/status-tag.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  const selector = '[data-cy="decision-status-tag"]';

  it('should render status tag', () => {
    const params = {
      decision: 'Testing',
    };

    wrapper = render(params);

    wrapper.expectElement(selector).toExist();
    wrapper.expectText(selector).toRead(params.decision);
  });

  describe('when decision is `Declined`', () => {
    it('should render with red class name', () => {
      const params = {
        decision: 'Declined',
      };

      wrapper = render(params);
      wrapper.expectElement(selector).hasClass('govuk-tag--red');
    });
  });

  describe('when decision is `Approved without conditions`', () => {
    it('should render with green class name', () => {
      const params = {
        decision: 'Approved without conditions',
      };

      wrapper = render(params);
      wrapper.expectElement(selector).hasClass('govuk-tag--green');
    });
  });

  describe('when decision is `Approved with conditions`', () => {
    it('should render with green class name', () => {
      const params = {
        decision: 'Approved with conditions',
      };

      wrapper = render(params);
      wrapper.expectElement(selector).hasClass('govuk-tag--green');
    });
  });
});
