const facilityGuaranteeAmend = require('./facility-guarantee-amend');

describe('facilityGuaranteeAmend', () => {
  describe('when the facility amount is being amended', () => {
    it('should return amount with two decimal points', () => {
      // Arrange
      const payload = { amount: 123.456 };
      const expected = {
        guaranteedLimit: 123.46,
      };

      // Act
      const result = facilityGuaranteeAmend(payload);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should returns the amount as a number with two decimal points', () => {
      // Arrange
      const payload = { amount: '123,456.7890' };
      const expected = { guaranteedLimit: 123456.79 };

      // Act
      const result = facilityGuaranteeAmend(payload);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should return an empty object', () => {
      // Act
      const result = facilityGuaranteeAmend({});

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('when the facility cover end date is being amended', () => {
    it('should return cover end in YYYY-MM-DD format', () => {
      // Arrange
      const payload = { coverEndDate: 1898252717000 };
      const expected = {
        expirationDate: '2030-02-25',
      };

      // Act
      const result = facilityGuaranteeAmend(payload);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should return cover end in YYYY-MM-DD format', () => {
      // Arrange
      const payload = { coverEndDate: '1898252717000' };
      const expected = {
        expirationDate: '2030-02-25',
      };

      // Act
      const result = facilityGuaranteeAmend(payload);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should return an empty object with starting EPOCH', () => {
      // Arrange
      const payload = { coverEndDate: 0 };

      // Act
      const result = facilityGuaranteeAmend(payload);

      // Assert
      expect(result).toEqual({});
    });

    it('should return an empty object', () => {
      // Act
      const result = facilityGuaranteeAmend({});

      // Assert
      expect(result).toEqual({});
    });
  });

  describe('when both amount and cover end date is being amended', () => {
    it('should return  amount with two decimal points and cover end in YYYY-MM-DD format', () => {
      // Arrange
      const payload = { amount: '123,456.7890', coverEndDate: 1898252717000 };
      const expected = {
        guaranteedLimit: 123456.79,
        expirationDate: '2030-02-25',
      };

      // Act
      const result = facilityGuaranteeAmend(payload);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('when everything is being amended with additional unknown properties in the payload', () => {
    it('should return  amount with two decimal points and cover end in YYYY-MM-DD format', () => {
      // Arrange
      const payload = { amount: '123,456.7890', coverEndDate: 1898252717000, unknownProperty: 'unknown' };
      const expected = {
        guaranteedLimit: 123456.79,
        expirationDate: '2030-02-25',
      };

      // Act
      const result = facilityGuaranteeAmend(payload);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('when nothing is being amended', () => {
    it('should return an empty object', () => {
      // Act
      const result = facilityGuaranteeAmend({});

      // Assert
      expect(result).toEqual({});
    });

    it('should return an empty object', () => {
      // Act
      const result = facilityGuaranteeAmend(null);

      // Assert
      expect(result).toEqual({});
    });

    it('should return an empty object', () => {
      // Act
      const result = facilityGuaranteeAmend(undefined);

      // Assert
      expect(result).toEqual({});
    });
  });
});
