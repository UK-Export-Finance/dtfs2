import httpMocks from 'node-mocks-http';
import { xss } from './index';

describe('xss', () => {
  const next = jest.fn();
  console.error = jest.fn();

  const assertions = [
    {
      input: { dealId: '123' },
      output: { dealId: '123' },
    },
    {
      input: { dealId: '<123>' },
      output: { dealId: '&lt;123&gt;' },
    },
    {
      input: { dealId: '<script>alert();</script>' },
      output: { dealId: '' },
    },
    {
      input: { dealId: '<object src = "data:1234">' },
      output: { dealId: '' },
    },
    {
      input: { dealId: '<h1>test</h1>' },
      output: { dealId: 'test' },
    },
    {
      input: { dealId: '123&123' },
      output: { dealId: '123&123' },
    },
    {
      input: { dealId: '<img src = "data:ABC123" />' },
      output: { dealId: '' },
    },
    {
      input: { dealId: 'This is a test case of AVG(123) and MAX(123)!!@ for £123.123 at %50.123 ^*-+=:"/\\' },
      output: { dealId: 'This is a test case of AVG(123) and MAX(123)!!@ for £123.123 at %50.123 ^*-+=:"/\\' },
    },
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each(assertions)('should call xssClean function when req.params is supplied as %s', ({ input, output }) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      params: input,
    });

    // Act
    xss(req, res, next);

    // Assert
    expect(console.error).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);

    expect(req.params).toEqual(output);
  });

  it.each(assertions)('should call xssClean function when req.query is supplied as %s', ({ input, output }) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      query: input,
    });

    // Act
    xss(req, res, next);

    // Assert
    expect(console.error).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);

    expect(req.query).toEqual(output);
  });

  it.each(assertions)('should call xssClean function when req.body is supplied as %s', ({ input, output }) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      body: input,
    });

    // Act
    xss(req, res, next);

    // Assert
    expect(console.error).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);

    expect(req.body).toEqual(output);
  });

  it.each(assertions)('should call xssClean function when all req.params, req.query and req.body are supplied as %s', ({ input, output }) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      query: input,
      params: input,
      body: input,
    });

    // Act
    xss(req, res, next);

    // Assert
    expect(console.error).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);

    expect(req.params).toEqual(output);
    expect(req.query).toEqual(output);
    expect(req.body).toEqual(output);
  });

  it('should catch an error when thrown', () => {
    const { res } = httpMocks.createMocks({ url: 'http://localhost:500/valid' });
    const mockError = new TypeError("Cannot read properties of null (reading 'params')");

    // @ts-ignore
    xss(null, res, next);

    expect(console.error).toHaveBeenCalledWith('An error has occurred while sanitising the request %s %o', undefined, mockError);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
