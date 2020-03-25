const page = {
  confirm: () => {
    cy.location('href').then((url) => {
      return url.matches(/start-now/g);
    })
  },
  dashboard: () => '//TODO',
  createNewSubmission: () => cy.contains('Create new submission'),
  dashboardView: () => '//TODO',
}

module.exports = page;
