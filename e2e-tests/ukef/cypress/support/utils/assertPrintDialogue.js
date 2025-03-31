export const assertPrintDialogue = (printButton) => {
  cy.window().then((win) => {
    cy.stub(win, 'print').as('printDialog');
  });

  // Click the print button
  printButton().click();

  // Assert that the print dialog was triggered
  cy.get('@printDialog').should('be.calledOnce');
};
