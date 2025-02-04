const utilisationReportConfirmDeletePaymentPage = {
  noRadio: () => cy.get('input[type=radio][value="no"]'),
  yesRadio: () => cy.get('input[type=radio][value="yes"]'),
  continueButton: () => cy.get('button:contains("Continue")'),
};

module.exports = { utilisationReportConfirmDeletePaymentPage };
