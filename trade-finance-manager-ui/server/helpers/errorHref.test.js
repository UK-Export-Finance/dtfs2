import errorHref from './errorHref.helper';

describe('errorHref', () => {
  it('should return a html id selector', () => {
    expect(errorHref('test')).toEqual('#test');
  });
});
