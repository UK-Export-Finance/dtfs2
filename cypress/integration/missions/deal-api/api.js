module.exports = () => {
  return {
    host: Cypress.config('apiHost'),
    port: Cypress.config('apiPort'),
  }
}
