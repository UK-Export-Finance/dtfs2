module.exports = (reports) => {
  console.info('inserting utilisation report details');
  cy.task('insertUtilisationReportsIntoDb', reports);
};
