const mapPremiumSchedule = require('./mapPremiumSchedule');

describe('mapPremiumSchedule', () => {
  it('should return array with formattedIncome', () => {
    const mockPremiumSchedule = [
      {
        test: true,
        income: 1200,
      },
      {
        test: true,
        income: 2200,
      },
    ];

    const result = mapPremiumSchedule(mockPremiumSchedule);

    const expected = [
      {
        ...mockPremiumSchedule[0],
        formattedIncome: mockPremiumSchedule[0].income.toFixed(2),
      },
      {
        ...mockPremiumSchedule[1],
        formattedIncome: mockPremiumSchedule[1].income.toFixed(2),
      },
    ];

    expect(result).toEqual(expected);
  });
});
