const expectNotAuthenticatedResponse = ({ status, body }) => {
  expect(status).toBe(401);
  expect(body).toStrictEqual({});
};

const withApiKeyAuthenticationTests = ({ makeRequestWithHeaders }) => {
  it('returns a 401 response if the request does not have an x-api-key header', async () => {
    const response = await makeRequestWithHeaders({});
    expectNotAuthenticatedResponse(response);
  });

  it('returns a 401 response if the request has an empty x-api-key header', async () => {
    const response = await makeRequestWithHeaders({ 'x-api-key': '' });
    expectNotAuthenticatedResponse(response);
  });
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

const withPartial2FaOnlyAuthenticationTests = ({ makeRequestWithoutAuthHeader, makeRequestWithAuthHeader, get2faCompletedUserToken }) => {
  withClientAuthenticationTests({ makeRequestWithoutAuthHeader, makeRequestWithAuthHeader });

  it('returns a 401 response if the request has an Authorization header with a 2fa-completed token', async () => {
    const response = await makeRequestWithAuthHeader(get2faCompletedUserToken());
    expectNotAuthenticatedResponse(response);
  });
};

module.exports = {
  withApiKeyAuthenticationTests,
  withClientAuthenticationTests,
  withPartial2FaOnlyAuthenticationTests,
};
