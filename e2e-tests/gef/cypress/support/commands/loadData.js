/**
 * Mock data loader:
 * 1. Clears all the collections
 * 2. Inserts mocked data
 */

const loadData = () => {
  // Load mock data
  // Command context is the 'dtfs2/e2e-tests/gef' directory
  cy.exec('cd .. && npm run load');
};

export default loadData;
