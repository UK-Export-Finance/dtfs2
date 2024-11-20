/**
 * insertElement
 * inserts an element in a div
 *
 * @param {string} divId
 */
const insertElement = (divId) => {
  cy.window().then((win) => {
    // input type is created
    const textInput = win.document.createElement('INPUT');
    // given type of text, data-cy, name and id
    textInput.setAttribute('type', 'text');
    textInput.setAttribute('data-cy', 'intruder');
    textInput.setAttribute('name', 'intruder');
    textInput.setAttribute('id', 'intruder');

    // gets the buyer-name div which is part of the form
    // wait for the element to be available in the DOM
    cy.get('body').then(($body) => {
      if ($body.find(`#${divId}`).length) {
        cy.get(`#${divId}`)
          .should('exist')
          .then(($div) => {
            const div = $div[0];
            // adds element to div so is part of the form
            div.appendChild(textInput);
            // types text into the field
            cy.keyboardInput(cy.get('[data-cy="intruder"]'), 'input text');
          });
      } else {
        // Create the div if it doesn't exist
        const newDiv = win.document.createElement('div');
        newDiv.setAttribute('id', divId);
        win.document.body.appendChild(newDiv);
        newDiv.appendChild(textInput);
        cy.keyboardInput(cy.get('[data-cy="intruder"]'), 'input text');
      }
    });
  });
};

module.exports = insertElement;
