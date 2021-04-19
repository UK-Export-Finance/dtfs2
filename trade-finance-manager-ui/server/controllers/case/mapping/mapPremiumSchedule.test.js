import mapPremiumSchedule from './mapPremiumSchedule';

const mockSchedule = [
  {
    income: 12.3456,
  },
  {
    income: 7.4,
  },
];


describe('mapPremiumSchedule', () => {
  it('should add formattedIncome property to each object with two digits', () => {
    const result = mapPremiumSchedule(mockSchedule);
    expect(result.length).toEqual(2);
    expect(result[0].formattedIncome).toEqual('12.35');
    expect(result[1].formattedIncome).toEqual('7.40');
  });
  it('should return an empty map if schedule is null', () => {
    const result = mapPremiumSchedule(null);
    expect(result.length).toEqual(0);
  });
});
