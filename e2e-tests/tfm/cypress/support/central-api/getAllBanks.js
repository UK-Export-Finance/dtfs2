module.exports = () => {
  console.info('getting all banks from database');
  return cy.task('getAllBanks');
};
