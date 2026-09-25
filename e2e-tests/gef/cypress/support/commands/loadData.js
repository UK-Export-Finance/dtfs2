/**
 * Mock data loader:
 * 1. Clears all the collections
 * 2. Inserts mocked data
 */

const loadData = () => cy.task('runLoadData');

export default loadData;
