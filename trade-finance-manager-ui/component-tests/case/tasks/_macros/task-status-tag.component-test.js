const { componentRenderer } = require('../../../componentRenderer');

const component = '../templates/case/tasks/_macros/task-status-tag.njk';

const render = componentRenderer(component);

describe(component, () => {
  describe('when status is `Cannot start yet`', () => {
    it('should render govukTag with grey class', () => {
      const params = {
        status: 'Cannot start yet',
      };
      const wrapper = render(params);

      wrapper.expectElement('[data-cy="status-tag"]').hasClass('govuk-tag--grey');
      wrapper.expectText('[data-cy="status-tag"]').toRead(params.status);
    });
  });

  describe('when status is `To do`', () => {
    it('should render govukTag', () => {
      const params = {
        status: 'To do',
      };
      const wrapper = render(params);

      wrapper.expectText('[data-cy="status-tag"]').toRead(params.status);
    });
  });

  describe('when status is `In progress`', () => {
    it('should render govukTag with yellow class', () => {
      const params = {
        status: 'In progress',
      };
      const wrapper = render(params);

      wrapper.expectElement('[data-cy="status-tag"]').hasClass('govuk-tag--yellow');
      wrapper.expectText('[data-cy="status-tag"]').toRead(params.status);
    });
  });

  describe('when status is `Done`', () => {
    it('should render govukTag with green class', () => {
      const params = {
        status: 'Done',
      };
      const wrapper = render(params);

      wrapper.expectElement('[data-cy="status-tag"]').hasClass('govuk-tag--green');
      wrapper.expectText('[data-cy="status-tag"]').toRead(params.status);
    });
  });
});
