const { dateHasAllValues, dateHasSomeValues, dateValidationText } = require('./date');

describe('validation - date-field', () => {
  describe('dateHasAllValues', () => {
    it('should return true when day, month and year is provided', () => {
      const result = dateHasAllValues('01', '02', '2020');
      expect(result).toEqual(true);
    });

    it('should return false when day or month or year is missing', () => {
      expect(dateHasAllValues('', '02', '2020')).toEqual(false);
      expect(dateHasAllValues('01', '', '2020')).toEqual(false);
      expect(dateHasAllValues('01', '02', '')).toEqual(false);
      expect(dateHasAllValues('01', '', '')).toEqual(false);
      expect(dateHasAllValues('', '02', '2020')).toEqual(false);
      expect(dateHasAllValues()).toEqual(false);
      expect(dateHasAllValues('', '')).toEqual(false);
      expect(dateHasAllValues('01/02/2020')).toEqual(false);
    });
  });

  describe('dateHasSomeValues', () => {
    it('should return true when only day is provided', () => {
      const result = dateHasSomeValues('01');
      expect(result).toEqual(true);
    });

    it('should return true when only month is provided', () => {
      const result = dateHasSomeValues('', '02');
      expect(result).toEqual(true);
    });

    it('should return true when only year is provided', () => {
      const result = dateHasSomeValues('', '', '2020');
      expect(result).toEqual(true);
    });

    it('should return false when no values provided', () => {
      expect(dateHasSomeValues('', '', '')).toEqual(false);
      expect(dateHasSomeValues()).toEqual(false);
    });
  });

  describe('dateValidationText', () => {
    it('should return the correct string/message depending on which part of the date is missing', () => {
      const mockFieldTitle = 'Field Name';

      let result = dateValidationText(mockFieldTitle, '01', '', '');
      let expected = `${mockFieldTitle} must include month and year`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldTitle, '01', '02', '');
      expected = `${mockFieldTitle} must include a year`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldTitle, '01', '', '2020');
      expected = `${mockFieldTitle} must include a month`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldTitle, '', '02', '');
      expected = `${mockFieldTitle} must include day and year`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldTitle, '', '02', '2020');
      expected = `${mockFieldTitle} must include a day`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldTitle, '', '', '2020');
      expected = `${mockFieldTitle} must include day and month`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldTitle, '', '', '');
      expected = `Enter the ${mockFieldTitle}`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldTitle);
      expected = `Enter the ${mockFieldTitle}`;
      expect(result).toEqual(expected);
    });
  });
});
