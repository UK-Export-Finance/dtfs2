import dashIfEmpty from './filter-dashIfEmpty';

describe('nunjuck filters - dashIfEmpty', () => {
  it('should return string if text is non-zero number', () => {
    const result = dashIfEmpty(1234);

    const expected = '1234';
    expect(result).toEqual(expected);
  });

  it('should return string, if its non-empty', () => {
    const result = dashIfEmpty('hello');

    expect(result).toEqual('hello');
  });

  const returnDashCases = [
    { argument: undefined, description: 'undefined' },
    { argument: '', description: 'empty string' },
    { argument: NaN, description: 'NaN' },
    { argument: 'NaN', description: '"NaN"' },
    { argument: '    ', description: 'whitespace' },
    { argument: 'Invalid date', description: '`Invalid date`' },
    { argument: new Date(NaN), description: 'an invalid Date' },
    { argument: 0, description: '0' },
  ];

  it.each(returnDashCases)('should return `-` when argument is $description', ({ argument }) => {
    const result = dashIfEmpty(argument);

    expect(result).toEqual('-');
  });
});
