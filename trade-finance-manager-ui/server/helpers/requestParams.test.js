import requestParams from './requestParams';

describe('requestParams', () => {
  it('should return an object with properties from request session', () => {

    const mockSession = {
      userToken: 'mock token',
    };

    const mockReq = {
      session: mockSession,
    };

    expect(requestParams(mockReq)).toEqual({
      userToken: mockReq.session.userToken,
    });
  });
});
