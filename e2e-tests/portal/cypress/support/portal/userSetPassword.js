const { changePassword, resetPassword } = require('../../e2e/pages');

module.exports = (email, password) => {
  cy.task('getUserFromDbByEmail', email).then((user) => {
    resetPassword.visitChangePassword(user.resetPwdToken);
    changePassword.password().type(password);
    changePassword.confirmPassword().type(password);
    cy.clickSubmitButton();
  });
};
