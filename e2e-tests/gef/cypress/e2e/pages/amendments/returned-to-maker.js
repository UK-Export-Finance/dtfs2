const returnedToMaker = {
  returnedToMakerConfirmationPanel: () => cy.get('[data-cy="returned-to-maker-confirmation-panel"'),
  whatHappensNextHeading: () => cy.get('[data-cy="heading"]'),
  whatHappensNextText: () => cy.get('[data-cy="what-happens-next-text"]'),
};

module.exports = returnedToMaker;
