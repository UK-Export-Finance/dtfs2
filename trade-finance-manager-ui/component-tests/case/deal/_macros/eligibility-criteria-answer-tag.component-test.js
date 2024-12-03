const { componentRenderer } = require('../../../componentRenderer');

const component = '../templates/case/deal/_macros/eligibility-criteria-answer-tag.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  // NOTE: the actual answer data is a boolean, but Nunjucks reads this as a string.
  // Therefore in this test, we pass a string.
  describe('when params.answer is `true`', () => {
    beforeEach(() => {
      const params = { answer: true };
      wrapper = render(params);
    });

    it('should render `Passed` text', () => {
      wrapper.expectText('[data-cy="eligibility-criteria-answer-tag"]').toRead('Passed');
    });

    it('should render green colour class', () => {
      wrapper.expectElement('[data-cy="eligibility-criteria-answer-tag"]').hasClass('govuk-tag--green');
    });
  });

  describe('when params.answer is `false`', () => {
    beforeEach(() => {
      const params = { answer: 'false' };
      wrapper = render(params);
    });

    it('should render `Failed` text', () => {
      wrapper.expectText('[data-cy="eligibility-criteria-answer-tag"]').toRead('Failed');
    });

    it('should render red colour class', () => {
      wrapper.expectElement('[data-cy="eligibility-criteria-answer-tag"]').hasClass('govuk-tag--red');
    });
  });
});
