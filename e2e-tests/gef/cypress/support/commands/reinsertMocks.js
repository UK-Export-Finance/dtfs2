const clearDatabase = () => {
  cy.exec('cd dtfs2 && npm run load');
};

export default clearDatabase;
