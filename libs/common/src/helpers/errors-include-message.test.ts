import { errorsIncludeMessage } from './errors-include-message';

describe('errors-include-message', () => {
  describe('errorsIncludeMessage', () => {
    it('returns false when errors is undefined', () => {
      const expected = false;
      const result = errorsIncludeMessage(undefined, 'expired');

      expect(result).toEqual(expected);
    });

    it('returns false for an empty errors array', () => {
      const expected = false;
      const result = errorsIncludeMessage([], 'expired');

      expect(result).toEqual(expected);
    });

    it('returns false when no messages match the substring', () => {
      const errors = [{ msg: 'some other error' }, { msg: 'another message' }];
      const expected = false;
      const result = errorsIncludeMessage(errors, 'expired');

      expect(result).toEqual(expected);
    });

    it('returns true when a message contains the substring (case-insensitive)', () => {
      const errors = [{ msg: 'This code has Expired' }, { msg: 'another' }];
      const expected = true;
      const result = errorsIncludeMessage(errors, 'expired');

      expect(result).toEqual(expected);
    });

    it('returns true when any message partially matches the substring', () => {
      const errors = [{ msg: 'access code expired at 10:00' }];
      const expected = true;
      const result = errorsIncludeMessage(errors, 'expired');

      expect(result).toEqual(expected);
    });

    it('ignores non-string msg values', () => {
      // deliberately use non-string msg values to ensure the helper ignores them
      const errors: unknown = [{ msg: 123 }, { msg: undefined }];
      const expected = false;
      const result = errorsIncludeMessage(errors as Array<{ msg?: string }>, 'expired');

      expect(result).toEqual(expected);
    });
  });
});
