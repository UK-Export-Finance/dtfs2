import { validateSsoProfileUrl, DEFAULT_MS_SSO_PROFILE_URL } from './validateSsoProfileUrl';

describe('validateSsoProfileUrl', () => {
  describe('when the value is a valid https URL for an allow-listed hostname', () => {
    it('should return the URL unchanged', () => {
      const url = 'https://myaccount.microsoft.com/';

      expect(validateSsoProfileUrl(url)).toEqual('https://myaccount.microsoft.com/');
    });

    it('should preserve query strings and paths on the allow-listed hostname', () => {
      const url = 'https://myaccount.microsoft.com/profile?ref=tfm';

      expect(validateSsoProfileUrl(url)).toEqual('https://myaccount.microsoft.com/profile?ref=tfm');
    });
  });

  describe('when the value is missing', () => {
    it.each([[undefined], [''], ['   '], ['\n'], ['\t']])('should return the safe default for %p', (value) => {
      expect(validateSsoProfileUrl(value)).toEqual(DEFAULT_MS_SSO_PROFILE_URL);
    });
  });

  describe('when the value has surrounding whitespace', () => {
    it.each([['  https://myaccount.microsoft.com/  '], ['https://myaccount.microsoft.com/\n'], ['\thttps://myaccount.microsoft.com/']])(
      'should trim %p before parsing and return the URL',
      (value) => {
        expect(validateSsoProfileUrl(value)).toEqual('https://myaccount.microsoft.com/');
      },
    );
  });

  describe('when the value carries userinfo', () => {
    it.each([['https://user@myaccount.microsoft.com/'], ['https://user:pass@myaccount.microsoft.com/'], ['https://:pass@myaccount.microsoft.com/']])(
      'should return the safe default for %p to avoid deceptive links',
      (value) => {
        expect(validateSsoProfileUrl(value)).toEqual(DEFAULT_MS_SSO_PROFILE_URL);
      },
    );
  });

  describe('when the value uses a disallowed scheme', () => {
    // Split to avoid the ESLint no-script-url rule flagging the raw literal.
    const javascriptUrl = `${'java'}${'script'}:alert(1)`;

    it.each([[javascriptUrl], ['http://myaccount.microsoft.com/'], ['data:text/html,<script>alert(1)</script>'], ['file:///etc/passwd']])(
      'should return the safe default for %p',
      (value) => {
        expect(validateSsoProfileUrl(value)).toEqual(DEFAULT_MS_SSO_PROFILE_URL);
      },
    );
  });

  describe('when the value targets a hostname that is not on the allow-list', () => {
    it.each([['https://evil.example.com/'], ['https://microsoft.com.evil.example/'], ['https://login.microsoftonline.com/']])(
      'should return the safe default for %p',
      (value) => {
        expect(validateSsoProfileUrl(value)).toEqual(DEFAULT_MS_SSO_PROFILE_URL);
      },
    );
  });

  describe('when the value is not a parseable URL', () => {
    it.each([['not-a-url'], ['://missing-scheme'], ['https://']])('should return the safe default for %p', (value) => {
      expect(validateSsoProfileUrl(value)).toEqual(DEFAULT_MS_SSO_PROFILE_URL);
    });
  });
});
