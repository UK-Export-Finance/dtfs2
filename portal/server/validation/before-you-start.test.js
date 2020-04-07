import beforeYouStartValidation from './before-you-start';

describe('beforeYouStartValidation', () => {
  const expectedValidationObj = {
    count: 1,
    errorList: {
      criteriaMet: {
        order: '1',
        text: 'Confirmation is required',
      },
    },
  };

  describe('when `criteriaMet` is undefined', () => {
    it('should return validation object', () => {
      const result = beforeYouStartValidation({
        criteriaMet: undefined,
      });

      expect(result).toEqual(expectedValidationObj);
    });
  });

  describe('when `criteriaMet` is true', () => {
    it('should return false', () => {
      const result = beforeYouStartValidation({
        criteriaMet: true,
      });

      expect(result).toEqual(false);
    });
  });
});
