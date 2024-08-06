const utilisationReportConfirmDeletePaymentPage = {
  selectNoRadio: () => cy.get('input[type=radio][value="no"]').click(),
  selectYesRadio: () => cy.get('input[type=radio][value="yes"]').click(),
  clickContinueButton: () => cy.get('button:contains("Continue")').click(),
};

module.exports = { utilisationReportConfirmDeletePaymentPage };
