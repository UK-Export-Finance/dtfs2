export default (labelText) => {
  return cy
    .contains('label', labelText)
    .invoke('attr', 'for')
    .then((id) => cy.get(`#${id}`));
};
