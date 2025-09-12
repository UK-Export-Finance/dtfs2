const { HttpStatusCode } = require('axios');
const ROLES = require('../../server/v1/roles/roles');

const expectNotAuthorisedResponse = ({ status, body }) => {
  expect(status).toEqual(HttpStatusCode.Unauthorized);
  expect(body).toStrictEqual({
    success: false,
    msg: "You don't have access to this page",
  });
};

const allRoles = Object.values(ROLES);

const withRoleAuthorisationTests = ({ allowedRoles, getUserWithRole, makeRequestAsUser, successStatusCode }) => {
  const notAllowedRoles = allRoles.filter((role) => !allowedRoles.includes(role));

  if (notAllowedRoles.length) {
    it.each(notAllowedRoles)(`should return a ${HttpStatusCode.Unauthorized} response for requests from a user with role %s`, async (role) => {
      const userWithRole = getUserWithRole(role);
      const response = await makeRequestAsUser(userWithRole);
      expectNotAuthorisedResponse(response);
    });
  }

  it.each(allowedRoles)(`returns a ${successStatusCode} response for requests from a user with role %s`, async (role) => {
    const userWithRole = getUserWithRole(role);
    const { status } = await makeRequestAsUser(userWithRole);
    expect(status).toEqual(successStatusCode);
  });
};

const malformedPayloadTests = ({ allowedRoles, getUserWithRole, makeRequestAsUser, successStatusCode }) => {
  const notAllowedRoles = allRoles.filter((role) => !allowedRoles.includes(role));

  if (notAllowedRoles.length) {
    it.each(notAllowedRoles)(`should return a ${HttpStatusCode.Unauthorized} response for requests from a user with role %s`, async (role) => {
      const userWithRole = getUserWithRole(role);
      const response = await makeRequestAsUser(userWithRole);
      expectNotAuthorisedResponse(response);
    });
  }

  it.each(allowedRoles)(`should return a ${successStatusCode} response for a malformed requests from a user with role %s`, async (role) => {
    const userWithRole = getUserWithRole(role);
    const { status } = await makeRequestAsUser(userWithRole);
    expect(status).toEqual(successStatusCode);
  });
};

module.exports = {
  withRoleAuthorisationTests,
  malformedPayloadTests,
};
