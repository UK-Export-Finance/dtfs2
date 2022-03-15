import requestParams from './requestParams';

describe('requestParams', () => {
  it('should return an object with properties from request params/session', () => {
    const mockParams = {
      _id: '12345678910',
      bondId: '012345678910',
    };

    const mockSession = {
      userToken: 'mock token',
    };

    const mockReq = {
      params: mockParams,
      session: mockSession,
    };

    expect(requestParams(mockReq)).toEqual({
      _id: mockReq.params._id,
      bondId: mockReq.params.bondId,
      userToken: mockReq.session.userToken,
    });
  });
});
