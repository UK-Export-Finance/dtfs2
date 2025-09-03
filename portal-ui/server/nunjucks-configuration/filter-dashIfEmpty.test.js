import dashIfEmpty from './filter-dashIfEmpty';

describe('nunjuck filters - dashIfEmpty', () => {
  it('should return string if text is number', () => {
    const result = dashIfEmpty(1234);

    const expected = '1234';
    expect(result).toEqual(expected);
  });

  it('should return string', () => {
    const result = dashIfEmpty('hello');

    expect(result).toEqual('hello');
  });

  it('should return dash if nothing passed', () => {
    const result = dashIfEmpty();

    expect(result).toEqual('-');
  });

  it('should return dash if empty string passed', () => {
    const result = dashIfEmpty('');

    expect(result).toEqual('-');
  });

  it('should return dash if NaN', () => {
    const result = dashIfEmpty('NaN');

    expect(result).toEqual('-');
  });
});
