const mapPremiumSchedule = require('./mapPremiumSchedule');

describe('mapPremiumSchedule', () => {
  it('should return array with formattedIncome', () => {
    const mockPremiumSchedule = [
      {
        testField: true,
        income: 1200,
      },
      {
        testField: true,
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
