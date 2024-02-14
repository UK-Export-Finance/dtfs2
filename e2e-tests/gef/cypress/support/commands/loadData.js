/**
 * Mock data loader:
 * 1. Clears all the collections
 * 2. Inserts mocked data
 */

const loadData = () => {
  // Load mock data
  cy.exec('npm run load');
};

export default loadData;
