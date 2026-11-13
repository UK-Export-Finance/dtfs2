/**
 * Mock data loader:
 * 1. Clears all the collections
 * 2. Inserts mocked data
 */

export const loadData = () => cy.task('runLoadData');
