import { generate2FAViewModel } from './generate-2fa-view-model';

describe('generate2FAViewModel', () => {
  const mockErrors = {
    sixDigitAccessCode: {
      text: 'The access code you have entered is incorrect',
      order: '1',
    },
  };

  describe('with validation errors', () => {
    it('should generate a 2FA view model with validation errors', () => {
      const result = generate2FAViewModel(2, 'test@example.com', '654321', mockErrors, { isSupportInfo: false, isAccessCodeLink: true });

      expect(result).toEqual({
        attemptsLeft: 2,
        requestNewCodeUrl: '/login/request-new-access-code',
        isSupportInfo: false,
        isAccessCodeLink: true,
        email: 'test@example.com',
        sixDigitAccessCode: '654321',
        validationErrors: mockErrors,
        accessCodeError: mockErrors.sixDigitAccessCode,
      });
    });
  });

  describe('with no errors', () => {
    it('should generate a 2FA view model with null accessCodeError when errors is null', () => {
      const result = generate2FAViewModel(1, 'user@example.com', '123456', null, { isSupportInfo: true, isAccessCodeLink: false });

      expect(result).toEqual({
        attemptsLeft: 1,
        requestNewCodeUrl: '/login/request-new-access-code',
        isSupportInfo: true,
        isAccessCodeLink: false,
        email: 'user@example.com',
        sixDigitAccessCode: '123456',
        validationErrors: null,
        accessCodeError: null,
      });
    });
  });

  describe('with errors missing sixDigitAccessCode field', () => {
    it('should set accessCodeError to null when sixDigitAccessCode field is not present', () => {
      const errorsWithoutAccessCode = {
        other: {
          text: 'Some other error',
          order: '1',
        },
      };

      const result = generate2FAViewModel(0, 'another@example.com', '789012', errorsWithoutAccessCode, { isSupportInfo: true, isAccessCodeLink: false });

      expect(result.validationErrors).toEqual(errorsWithoutAccessCode);
      expect(result.accessCodeError).toBeNull();
    });
  });

  describe('with undefined attemptsLeft and userEmail', () => {
    it('should handle undefined values gracefully', () => {
      const result = generate2FAViewModel(undefined, undefined, '', null, { isSupportInfo: false, isAccessCodeLink: true });

      expect(result).toEqual({
        attemptsLeft: undefined,
        requestNewCodeUrl: '/login/request-new-access-code',
        isSupportInfo: false,
        isAccessCodeLink: true,
        email: undefined,
        sixDigitAccessCode: '',
        validationErrors: null,
        accessCodeError: null,
      });
    });
  });

  describe('with different config combinations', () => {
    it('should respect isSupportInfo and isAccessCodeLink configuration', () => {
      const configs = [
        { isSupportInfo: true, isAccessCodeLink: true },
        { isSupportInfo: true, isAccessCodeLink: false },
        { isSupportInfo: false, isAccessCodeLink: true },
        { isSupportInfo: false, isAccessCodeLink: false },
      ];

      configs.forEach((config) => {
        const result = generate2FAViewModel(1, 'test@example.com', '000000', null, config);

        expect(result.isSupportInfo).toBe(config.isSupportInfo);
        expect(result.isAccessCodeLink).toBe(config.isAccessCodeLink);
      });
    });
  });

  describe('requestNewCodeUrl', () => {
    it('should always set requestNewCodeUrl to /login/request-new-access-code', () => {
      const result = generate2FAViewModel(2, 'test@example.com', '654321', mockErrors, { isSupportInfo: false, isAccessCodeLink: true });

      expect(result.requestNewCodeUrl).toBe('/login/request-new-access-code');
    });
  });

  describe('with errors object containing order field', () => {
    it('should include the order field in accessCodeError', () => {
      const errorsWithOrder = {
        sixDigitAccessCode: {
          text: 'Invalid code',
          order: '2',
        },
      };

      const result = generate2FAViewModel(1, 'test@example.com', '123456', errorsWithOrder, { isSupportInfo: false, isAccessCodeLink: false });

      expect(result.accessCodeError).toEqual({
        text: 'Invalid code',
        order: '2',
      });
    });
  });

  describe('with errors object without order field', () => {
    it('should handle sixDigitAccessCode error without order field', () => {
      const errorsWithoutOrder = {
        sixDigitAccessCode: {
          text: 'Invalid code',
        },
      };

      const result = generate2FAViewModel(1, 'test@example.com', '123456', errorsWithoutOrder, { isSupportInfo: false, isAccessCodeLink: false });

      expect(result.accessCodeError).toEqual({
        text: 'Invalid code',
      });
    });
  });
});
