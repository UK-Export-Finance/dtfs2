module.exports = () => {
  console.info('removing all utilisation report details');
  cy.task('removeAllUtilisationReportDetailsFromDb');
};
