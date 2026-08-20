import axios from 'axios';
import { removePassword, removePasswordFromError, isPasswordField } from './index';

describe('remove-password-from-error middleware', () => {
  describe('isPasswordField', () => {
    it.each([['password'], ['Password'], ['newPassword'], ['confirm_password']])('should return true for keys that include %s', (key) => {
      expect(isPasswordField(key)).toBe(true);
    });

    it.each([['username'], ['email'], ['token']])('should return false for keys that do not include %s', (key) => {
      expect(isPasswordField(key)).toBe(false);
    });
  });

  describe('removePassword', () => {
    it('should remove password fields from a JSON string', () => {
      // Arrange
      const data = '{"username":"user@example.com","password":"secret"}';

      // Act
      const result = removePassword(data);

      // Assert
      const expected = '{"username":"user@example.com"}';
      expect(result).toEqual(expected);
    });

    it('should remove multiple password-like fields', () => {
      // Arrange
      const data = '{"password":"a","newPassword":"b","username":"u"}';

      // Act
      const result = removePassword(data);

      // Assert
      const expected = '{"username":"u"}';
      expect(result).toEqual(expected);
    });

    it('should return the original string if it is not valid JSON', () => {
      // Arrange
      const data = 'not-json';

      // Act
      const result = removePassword(data);

      // Assert
      expect(result).toEqual(data);
    });
  });

  describe('removePasswordFromError', () => {
    let onRejected: ((error: unknown) => Promise<unknown>) | undefined;

    beforeEach(() => {
      jest.spyOn(axios.interceptors.response, 'use').mockImplementation((_onFulfilled, interceptor) => {
        onRejected = interceptor ?? undefined;
        return 0;
      });

      removePasswordFromError(axios);
    });

    it('should register an Axios response interceptor', () => {
      expect(axios.interceptors.response.use).toHaveBeenCalledTimes(1);
    });

    it('should remove the password from the error config data and re-reject', async () => {
      const error = { config: { data: '{"username":"u@example.com","password":"secret"}' } };

      await expect(onRejected!(error)).rejects.toBe(error);

      expect(error.config.data).toEqual('{"username":"u@example.com"}');
    });
  });
});
