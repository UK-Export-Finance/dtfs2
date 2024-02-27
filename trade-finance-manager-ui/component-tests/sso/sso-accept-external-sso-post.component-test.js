const pageRenderer = require('../pageRenderer');

const page = '../templates/sso/accept-external-sso-post.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('hiddent input "code" should exist', () => {
    wrapper.expectElement('[name="code"]').toExist();
  });

  it('hiddent input "formId" should exist', () => {
    wrapper.expectElement('[name="formId"]').toExist();
  });

  it('hiddent input "clientInfo" should exist', () => {
    wrapper.expectElement('[name="clientInfo"]').toExist();
  });

  it('hiddent input "state" should exist', () => {
    wrapper.expectElement('[name="state"]').toExist();
  });

  it('hiddent input "sessionState" should exist', () => {
    wrapper.expectElement('[name="sessionState"]').toExist();
  });

  it('should contain message for user with javascript', () => {
    wrapper.expectText('[data-cy="message-for-users-with-javascript"]').toRead('Working...');
  });

  it('should contain Continue button', () => {
    wrapper.expectText('[data-cy="submit-button"]').toRead('Continue');
  });

});
