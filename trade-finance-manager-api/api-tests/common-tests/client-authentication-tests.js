const expectNotAuthenticatedResponse = ({ status, body }) => {
  expect(status).toBe(401);
  expect(body).toStrictEqual({});
};

const withClientAuthenticationTests = ({ makeRequestWithoutAuthHeader, makeRequestWithAuthHeader }) => {
  it('returns a 401 response if the request does not have a Authorization header', async () => {
    const response = await makeRequestWithoutAuthHeader();
    expectNotAuthenticatedResponse(response);
  });

  it('returns a 401 response if the request has an empty Authorization header', async () => {
    const response = await makeRequestWithAuthHeader('');
    expectNotAuthenticatedResponse(response);
  });

  it('returns a 401 response if the request has an invalid Authorization header', async () => {
    const response = await makeRequestWithAuthHeader('not-a-real-auth-header');
    expectNotAuthenticatedResponse(response);
  });
};

module.exports = {
  withClientAuthenticationTests,
};
