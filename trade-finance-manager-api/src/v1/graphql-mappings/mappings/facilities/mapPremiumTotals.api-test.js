const mapPremiumTotals = require('./mapPremiumTotals');

describe('mapPremiumTotals', () => {
  it('should return total of all schedule items income', () => {
    const mockPremiumSchedule = [
      {
        income: 1200,
      },
      {
        income: 2200,
      },
    ];

    const result = mapPremiumTotals(mockPremiumSchedule);

    const expected = (mockPremiumSchedule[0].income + mockPremiumSchedule[1].income).toFixed(2);

    expect(result).toEqual(expected);
  });

  it('should return 0 when there is no premiumSchedule', () => {
    const result = mapPremiumTotals();

    expect(result).toEqual('0');
  });
});
