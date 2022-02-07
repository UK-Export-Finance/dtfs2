const { deleteUser, listAllUsers, logIn } = require('./api');

module.exports = (userToDelete, opts) => {
  console.info('removeUserIfPresent::');

  logIn(opts).then((token) => listAllUsers(token).then((users) => {
    const candidate = users.find((existingUser) => existingUser.username === userToDelete.username);

    return new Cypress.Promise((resolve, reject) => {
      if (candidate) {
        deleteUser(token, candidate);
      }
      resolve();
    });
  }));
};
