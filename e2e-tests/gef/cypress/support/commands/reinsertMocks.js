/* eslint-disable no-undef */
const clearDatabase = () => {
  cy.exec('cd ../../utils/mock-data-loader && node re-insert-mocks.js');
};

export default clearDatabase;
