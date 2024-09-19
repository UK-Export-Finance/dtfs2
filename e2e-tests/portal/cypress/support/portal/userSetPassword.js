const { changePassword, resetPassword } = require('../../e2e/pages');

module.exports = (email, password) => {
  cy.task('getUserFromDbByEmail', email).then((user) => {
    resetPassword.visitChangePassword(user.resetPwdToken);
    cy.keyboardInput(changePassword.password(), password);
    cy.keyboardInput(changePassword.confirmPassword(), password);
    cy.clickSubmitButton();
  });
};
