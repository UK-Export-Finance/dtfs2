/* eslint-disable no-undef */
const clearDatabase = () => {
  cy.exec('cd ../../utils/mock-data-loader && npm run load');
};

export default clearDatabase;
