module.exports = (deal, opts) => cy.insertManyGefApplications([deal], opts).then((inserted) => inserted[0]);
