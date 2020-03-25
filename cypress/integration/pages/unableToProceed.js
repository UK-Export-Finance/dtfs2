const page = {
  confirm: () => {
    cy.location('href').then((url) => {
      return url.matches(/unable-to-proceed/g);
    })
  },
}

module.exports = page;
