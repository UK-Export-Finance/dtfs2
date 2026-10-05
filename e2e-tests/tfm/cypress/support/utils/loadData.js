/**
 * Mock data loader:
 * 1. Clears all the collections
 * 2. Inserts mocked data for e2e tests
 */
const loadData = (command) => cy.task('runLoadData', command);

export default loadData;
