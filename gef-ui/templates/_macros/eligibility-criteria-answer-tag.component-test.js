const componentRenderer = require('../../component-tests/componentRenderer');

const component = '../templates/_macros/eligibility-criteria-answer-tag.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('when params.answer is `true`', () => {
    beforeEach(() => {
      const params = { answer: true };
      wrapper = render(params);
    });

    it('should render `TRUE` text', () => {
      wrapper.expectText('[data-cy="eligibility-criteria-answer-tag"]').toRead('true');
    });

    it('should render green colour class', () => {
      wrapper.expectElement('[data-cy="eligibility-criteria-answer-tag"]').hasClass('govuk-tag--green');
    });
  });

  describe('when params.answer is `false`', () => {
    beforeEach(() => {
      const params = { answer: false };
      wrapper = render(params);
    });

    it('should render `FALSE` text', () => {
      wrapper.expectText('[data-cy="eligibility-criteria-answer-tag"]').toRead('false');
    });

    it('should render red colour class', () => {
      wrapper.expectElement('[data-cy="eligibility-criteria-answer-tag"]').hasClass('govuk-tag--red');
    });
  });
});
