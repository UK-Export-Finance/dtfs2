const page = {
  confirm: () => {
    cy.url().then((url) => {
      return url.match(/start-now/g);
    })
  },
  dashboard: () => '//TODO',
  createNewSubmission: () => cy.contains('Create new submission'),
  dashboardView: () => '//TODO',
}

module.exports = page;
