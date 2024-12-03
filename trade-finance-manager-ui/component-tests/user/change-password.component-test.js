const { pageRenderer } = require('../pageRenderer');

const page = '../templates/user/change-password.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    dealId: '1234',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectText('[data-cy="change-your-password-heading"]').toRead('Change your password');
  });

  describe('form', () => {
    it('should render current password', () => {
      wrapper.expectElement('[data-cy="current-password"]').toExist();
    });

    it('should render new password', () => {
      wrapper.expectElement('[data-cy="new-password"]').toExist();
    });

    it('should render confirm password', () => {
      wrapper.expectElement('[data-cy="confirm-password"]').toExist();
    });

    it('should render submit button', () => {
      wrapper.expectElement('[data-cy="submit"]').toExist();
      wrapper.expectText('[data-cy="submit"]').toRead('Submit');
    });

    it('should render cancel button', () => {
      wrapper.expectElement('[data-cy="cancel"]').toExist();
      wrapper.expectText('[data-cy="cancel"]').toRead('Cancel');
    });
  });
});
