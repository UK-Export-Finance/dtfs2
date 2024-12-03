import errorHref from './errorHref';

describe('errorHref', () => {
  it('should return a html id selector', () => {
    expect(errorHref('test')).toEqual('#test');
  });
});
