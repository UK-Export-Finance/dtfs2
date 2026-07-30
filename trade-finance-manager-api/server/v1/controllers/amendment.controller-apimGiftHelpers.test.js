const api = require('../api');
const { hasFacilityAmendmentBeenSentToApimGift, markFacilityAmendmentAsSentToApimGift } = require('./amendment.controller');

jest.mock('../api', () => ({
  updateFacilityAmendment: jest.fn(),
}));

describe('hasFacilityAmendmentBeenSentToApimGift', () => {
  it('should return true when amendment apimGift facilityAmendmentSent is true', () => {
    // Act
    const result = hasFacilityAmendmentBeenSentToApimGift({ apimGift: { facilityAmendmentSent: true } });

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when amendment does not have apimGift', () => {
    // Act
    const result = hasFacilityAmendmentBeenSentToApimGift({});

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when amendment is undefined', () => {
    // Act
    const result = hasFacilityAmendmentBeenSentToApimGift(undefined);

    // Assert
    expect(result).toBe(false);
  });
});

describe('markFacilityAmendmentAsSentToApimGift', () => {
  const facilityId = '66b1f2f6f4b5a8f3c7d9e011';
  const amendmentId = '66b1f2f6f4b5a8f3c7d9e012';
  const auditDetails = { id: '6051d94564494924d38ce67c', userType: 'tfm' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set facilityAmendmentSent to true and keep existing apimGift fields', async () => {
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
    expect(api.updateFacilityAmendment).toHaveBeenNthCalledWith(
      1,
      facilityId,
      amendmentId,
      {
        apimGift: {
          existingField: 'existing-value',
          facilityAmendmentSent: true,
        },
        shouldNotUpdateTimestamp: true,
      },
      auditDetails,
    );
  });

  it('should set facilityAmendmentSent to true when apimGift is missing', async () => {
    // Act
    await markFacilityAmendmentAsSentToApimGift({
      facilityId,
      amendmentId,
      amendment: {},
      auditDetails,
    });

    // Assert
    expect(api.updateFacilityAmendment).toHaveBeenNthCalledWith(
      1,
      facilityId,
      amendmentId,
      {
        apimGift: {
          facilityAmendmentSent: true,
        },
        shouldNotUpdateTimestamp: true,
      },
      auditDetails,
    );
  });
});
