const pageRenderer = require('../pageRenderer');

const page = '_partials/footer.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  describe('viewed by a maker', () => {
    const user = {
      roles: ['maker'],
    };

    beforeAll(() => {
      wrapper = render({ user });
    });

    it('renders a feedback link', () => {
      wrapper.expectLink('[data-cy="feedback-link"]').toLinkTo('/feedback', 'Feedback');
    });
  });

  describe('viewed by a checker', () => {
    const user = {
      roles: ['checker'],
    };

    beforeAll(() => {
      wrapper = render({ user });
    });

    it('renders a feedback link', () => {
      wrapper.expectLink('[data-cy="feedback-link"]').toLinkTo('/feedback', 'Feedback');
    });
  });

  describe('viewed by a user with no roles', () => {
    const user = {
      roles: [],
    };

    beforeAll(() => {
      wrapper = render({ user });
    });

    it('does not render a feedback link', () => {
      wrapper.expectLink('[data-cy="feedback-link"]').notToExist();
    });
  });

  describe('viewed by a logged out user', () => {
    const user = {};

    beforeAll(() => {
      wrapper = render({ user });
    });

    it('does not render a feedback link', () => {
      wrapper.expectLink('[data-cy="feedback-link"]').notToExist();
    });
  });

});
