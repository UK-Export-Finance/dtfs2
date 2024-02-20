const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');

describe('deal submit - shouldUpdateDealFromMIAtoMIN', () => {
  const mockMIADeal = {
    submissionType: 'Manual Inclusion Application',
  };

  it('should return true when deal is MIA with `Approved (with conditions)` TFM decision', () => {
    const mockTfmDeal = {
      underwriterManagersDecision: {
        decision: 'Approved (with conditions)',
      },
    };

    const result = shouldUpdateDealFromMIAtoMIN(mockMIADeal, mockTfmDeal);

    expect(result).toEqual(true);
  });

  it('should return true when deal is MIA with `Approved (without conditions)` TFM decision', () => {
    const mockTfmDeal = {
      underwriterManagersDecision: {
        decision: 'Approved (without conditions)',
      },
    };

    const result = shouldUpdateDealFromMIAtoMIN(mockMIADeal, mockTfmDeal);

    expect(result).toEqual(true);
  });

  it('should return false when there is no decision', () => {
    const mockTfmDeal = {};

    const result = shouldUpdateDealFromMIAtoMIN(mockMIADeal, mockTfmDeal);

    expect(result).toEqual(false);
  });

  it('should return false when deal is MIN', () => {
    const mockMINDeal = {
      submissionType: 'Manual Inclusion Notice',
    };

    const result = shouldUpdateDealFromMIAtoMIN(mockMINDeal, {});

    expect(result).toEqual(false);
  });

  it('should return false when deal is AIN', () => {
    const mockAINDeal = {
      submissionType: 'Automatic Inclusion Notice',
    };

    const result = shouldUpdateDealFromMIAtoMIN(mockAINDeal, {});

    expect(result).toEqual(false);
  });
});