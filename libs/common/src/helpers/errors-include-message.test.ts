import { errorsIncludeMessage } from './errors-include-message';

describe('errors-include-message', () => {
  describe('errorsIncludeMessage', () => {
    it('returns false when errors is undefined', () => {
      expect(errorsIncludeMessage(undefined, 'expired')).toBe(false);
    });

    it('returns false for an empty errors array', () => {
      expect(errorsIncludeMessage([], 'expired')).toBe(false);
    });

    it('returns false when no messages match the substring', () => {
      const errors = [{ msg: 'some other error' }, { msg: 'another message' }];
      expect(errorsIncludeMessage(errors, 'expired')).toBe(false);
    });

    it('returns true when a message contains the substring (case-insensitive)', () => {
      const errors = [{ msg: 'This code has Expired' }, { msg: 'another' }];
      expect(errorsIncludeMessage(errors, 'expired')).toBe(true);
    });

    it('returns true when any message partially matches the substring', () => {
      const errors = [{ msg: 'access code expired at 10:00' }];
      expect(errorsIncludeMessage(errors, 'expired')).toBe(true);
    });

    it('ignores non-string msg values', () => {
      // deliberately use non-string msg values to ensure the helper ignores them
      const errors: unknown = [{ msg: 123 }, { msg: undefined }];
      expect(errorsIncludeMessage(errors as Array<{ msg?: string }>, 'expired')).toBe(false);
    });
  });
});
