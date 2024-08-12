/**
 * Mock data loader:
 * 1. Clears all the collections
 * 2. Inserts mocked data
 */

const loadData = () => {
  // Ensure project root directory
  cy.exec('if [ -d "dtfs2" ]; then cd dtfs2; fi');
  // Load mock data
  cy.exec('cd ../../utils && npm run mock-data-loader');
};

export default loadData;
