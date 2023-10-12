module.exports = (subject, toType) => {
  cy.wrap(subject).type(toType, { delay: 0 });
};
