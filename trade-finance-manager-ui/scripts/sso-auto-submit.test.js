const { isSafeReferrer } = require('./sso-auto-submit');

describe('isSafeReferrer', () => {
  const ssoAuthorityHost = 'sso-authority.com';
  const localhost = 'localhost';
  const aValidReferrer = 'https://sso-authority.com/test';
  const aLocalhostReferrer = 'localhost/test';

  beforeAll(() => {
    const acceptExternalSsoPostForm = document.createElement('form');
    acceptExternalSsoPostForm.id = 'acceptExternalSsoPostForm';
    document.body.appendChild(acceptExternalSsoPostForm);

    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('data-sso-authority', 'https://sso-authority.com');
    document.head.appendChild(scriptElement);
  });

  it('returns true if hostname is localhost', () => {
    expect(isSafeReferrer(localhost, aLocalhostReferrer)).toBe(true);
  });

  it('returns true if referrer is from SSO authority', () => {
    expect(isSafeReferrer(ssoAuthorityHost, aValidReferrer)).toBe(true);
  });

  it('returns false if attempting to spoof the valid url', () => {
    expect(isSafeReferrer(ssoAuthorityHost, `https://${ssoAuthorityHost}.evil-example.net/test`)).toBe(false);
  });

  it('returns false if referrer is not from SSO authority', () => {
    expect(isSafeReferrer(ssoAuthorityHost, 'https://example.com')).toBe(false);
  });

  it('returns false if referrer is missing', () => {
    expect(isSafeReferrer(ssoAuthorityHost, '')).toBe(false);
  });
});
