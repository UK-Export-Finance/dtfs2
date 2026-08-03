const api = require('../api');
const {
  hasFacilityAmendmentBeenSentToApimGift,
  markFacilityAmendmentAsSentToApimGift,
  parseCoverPercentage,
  enrichAmendmentForApimGift,
} = require('./amendment.controller');

jest.mock('../api', () => ({
  updateFacilityAmendment: jest.fn(),
}));

describe('hasFacilityAmendmentBeenSentToApimGift', () => {
  describe('when amendment apimGift facilityAmendmentSent is true', () => {
    it('should return true', () => {
      // Act
      const result = hasFacilityAmendmentBeenSentToApimGift({ apimGift: { facilityAmendmentSent: true } });

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when amendment does not have apimGift', () => {
    it('should return false', () => {
      // Act
      const result = hasFacilityAmendmentBeenSentToApimGift({});

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when amendment is undefined', () => {
    it('should return false', () => {
      // Act
      const result = hasFacilityAmendmentBeenSentToApimGift(undefined);

      // Assert
      expect(result).toBe(false);
    });
  });
});

describe('markFacilityAmendmentAsSentToApimGift', () => {
  const facilityId = '66b1f2f6f4b5a8f3c7d9e011';
  const amendmentId = '66b1f2f6f4b5a8f3c7d9e012';
  const auditDetails = { id: '6051d94564494924d38ce67c', userType: 'tfm' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when amendment has existing apimGift fields', () => {
    it('should set facilityAmendmentSent to true and keep existing fields', async () => {
      // Act
      await markFacilityAmendmentAsSentToApimGift({
        facilityId,
        amendmentId,
        amendment: {
          apimGift: {
            existingField: 'existing-value',
          },
        },
        auditDetails,
      });

      // Assert
      const expectedObject = {
        apimGift: {
          existingField: 'existing-value',
          facilityAmendmentSent: true,
        },
        shouldNotUpdateTimestamp: true,
      };

      expect(api.updateFacilityAmendment).toHaveBeenNthCalledWith(1, facilityId, amendmentId, expectedObject, auditDetails);
    });
  });

  describe('when amendment apimGift is missing', () => {
    it('should set facilityAmendmentSent to true', async () => {
      // Act
      await markFacilityAmendmentAsSentToApimGift({
        facilityId,
        amendmentId,
        amendment: {},
        auditDetails,
      });

      // Assert
      const expectedObject = {
        apimGift: {
          facilityAmendmentSent: true,
        },
        shouldNotUpdateTimestamp: true,
      };

      expect(api.updateFacilityAmendment).toHaveBeenNthCalledWith(1, facilityId, amendmentId, expectedObject, auditDetails);
    });
  });
});

describe('parseCoverPercentage', () => {
  describe('when value is a number', () => {
    it('should return the value unchanged', () => {
      // Act
      const result = parseCoverPercentage(80);

      // Assert
      expect(result).toBe(80);
    });
  });

  describe('when value is a non-finite number', () => {
    it('should return null', () => {
      // Act
      const nanResult = parseCoverPercentage(Number.NaN);
      const infinityResult = parseCoverPercentage(Number.POSITIVE_INFINITY);

      // Assert
      expect(nanResult).toBeNull();
      expect(infinityResult).toBeNull();
    });
  });

  describe('when value is a percentage string', () => {
    it('should parse and return the numeric value', () => {
      // Act
      const result = parseCoverPercentage(' 75% ');

      // Assert
      expect(result).toBe(75);
    });
  });

  describe('when value is an invalid percentage string', () => {
    it('should return null', () => {
      // Act
      const result = parseCoverPercentage('not-a-number%');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('when value type is unsupported', () => {
    it('should return null', () => {
      // Act
      const result = parseCoverPercentage({ value: 80 });

      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('enrichAmendmentForApimGift', () => {
  describe('when amendment coveredPercentage can be parsed', () => {
    it('should keep amendment coveredPercentage', () => {
      // Arrange
      const amendment = { coveredPercentage: '95%', amendmentId: 'amendment-1' };
      const facilitySnapshot = { coverPercentage: '80%' };

      // Act
      const result = enrichAmendmentForApimGift(amendment, facilitySnapshot);

      // Assert
      expect(result).toEqual({
        ...amendment,
        coveredPercentage: 95,
      });
    });
  });

  describe('when amendment coveredPercentage is missing and facility coverPercentage is present', () => {
    it('should fallback to facility coverPercentage', () => {
      // Arrange
      const amendment = { amendmentId: 'amendment-2' };
      const facilitySnapshot = { coverPercentage: '80%' };

      // Act
      const result = enrichAmendmentForApimGift(amendment, facilitySnapshot);

      // Assert
      expect(result).toEqual({
        ...amendment,
        coveredPercentage: 80,
      });
    });
  });

  describe('when facility coverPercentage is unavailable and coveredPercentage is present', () => {
    it('should fallback to facility coveredPercentage', () => {
      // Arrange
      const amendment = { amendmentId: 'amendment-3' };
      const facilitySnapshot = { coveredPercentage: '70%' };

      // Act
      const result = enrichAmendmentForApimGift(amendment, facilitySnapshot);

      // Assert
      expect(result).toEqual({
        ...amendment,
        coveredPercentage: 70,
      });
    });
  });

  describe('when amendment coveredPercentage is invalid and facility coverPercentage is present', () => {
    it('should fallback to facility coverPercentage', () => {
      // Arrange
      const amendment = { amendmentId: 'amendment-4', coveredPercentage: 'bad-value%' };
      const facilitySnapshot = { coverPercentage: '65%' };

      // Act
      const result = enrichAmendmentForApimGift(amendment, facilitySnapshot);

      // Assert
      expect(result).toEqual({
        ...amendment,
        coveredPercentage: 65,
      });
    });
  });

  describe('when amendment coveredPercentage is 0 and facility has a value', () => {
    it('should keep amendment coveredPercentage', () => {
      // Arrange
      const amendment = { amendmentId: 'amendment-5', coveredPercentage: 0 };
      const facilitySnapshot = { coverPercentage: '65%' };

      // Act
      const result = enrichAmendmentForApimGift(amendment, facilitySnapshot);

      // Assert
      expect(result).toEqual({
        ...amendment,
        coveredPercentage: 0,
      });
    });
  });
});
