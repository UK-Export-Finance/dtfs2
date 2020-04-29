module.exports = (deal, opts) => {
  return cy.insertManyDeals([deal], opts)
    .then(inserted => inserted[0])
}
