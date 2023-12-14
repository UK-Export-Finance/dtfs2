import { getIndustrySectorById, getIndustryClassById } from '.';

describe('getIndustrySectorById', () => {
  const mockIndustrySectors = [
    { code: '1234', name: 'A' },
    { code: '5678', name: 'B' },
    { code: '9112', name: 'C' },
  ];

  it('should return an object from id param', () => {
    const result = getIndustrySectorById(mockIndustrySectors, '5678');
    expect(result).toEqual(mockIndustrySectors[1]);
  });
});

describe('getIndustryClassById', () => {
  const industrySectorClasses = [
    { code: '1234', name: 'A' },
    { code: '5678', name: 'B' },
    { code: '9112', name: 'C' },
  ];

  it('should return an object from id param', () => {
    const result = getIndustryClassById(industrySectorClasses, '5678');
    expect(result).toEqual(industrySectorClasses[1]);
  });
});
