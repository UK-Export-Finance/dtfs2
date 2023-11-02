module.exports = (reports) => {
  cy.task('insertUtilisationReportDetailsIntoDb', reports);
};
