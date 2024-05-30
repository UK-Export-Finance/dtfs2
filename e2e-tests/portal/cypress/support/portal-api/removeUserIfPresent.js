const { deleteUser, listAllUsers, logIn } = require('./api');

module.exports = (userToDelete, opts) => {
  logIn(opts).then((token) =>
    listAllUsers(token).then((users) => {
      const candidate = users.find((existingUser) => existingUser.username === userToDelete.username);

      // eslint-disable-next-line no-unused-vars
      return new Cypress.Promise((resolve, reject) => {
        if (candidate) {
          deleteUser(token, candidate);
        }
        resolve();
      });
    }),
  );
};
