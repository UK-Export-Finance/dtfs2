module.exports = (facility, opts) => cy.insertManyGefFacilities([facility], opts).then((inserted) => inserted[0]);
