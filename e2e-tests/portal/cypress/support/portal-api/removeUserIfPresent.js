const { deleteUser, listAllUsers, logIn } = require('./api');

module.exports = (userToDelete, opts) => {
  console.log('removeUserIfPresent::');

  logIn(opts).then((token) => listAllUsers(token).then((users) => {
    const candidate = users.body.users.find((existingUser) => existingUser.username === userToDelete.username);

    return new Cypress.Promise((resolve, reject) => {
      if (candidate) {
        deleteUser(token, candidate);
      }
      resolve();
    });
  }));
};
