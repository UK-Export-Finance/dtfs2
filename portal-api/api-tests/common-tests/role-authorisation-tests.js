const ROLES = require('../../src/v1/roles/roles');

const expectNotAuthorisedResponse = ({ status, body }) => {
  expect(status).toBe(401);
  expect(body).toStrictEqual({
    success: false,
    msg: "You don't have access to this page",
  });
};

const allRoles = Object.values(ROLES);

const withRoleAuthorisationTests = ({ allowedRoles, getUserWithRole, makeRequestAsUser, successStatusCode }) => {
  const notAllowedRoles = allRoles.filter((role) => !allowedRoles.includes(role));

  if (notAllowedRoles.length) {
    it.each(notAllowedRoles)('returns a 401 response for requests from a user with role %s', async (role) => {
      const userWithRole = getUserWithRole(role);
      const response = await makeRequestAsUser(userWithRole);
      expectNotAuthorisedResponse(response);
    });
  }

  it.each(allowedRoles)(`returns a ${successStatusCode} response for requests from a user with role %s`, async (role) => {
    const userWithRole = getUserWithRole(role);
    const { status } = await makeRequestAsUser(userWithRole);
    expect(status).toBe(successStatusCode);
  });
};

module.exports = {
  withRoleAuthorisationTests,
};
