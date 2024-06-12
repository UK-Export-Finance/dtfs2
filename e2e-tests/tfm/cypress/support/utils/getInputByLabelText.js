export default (label) => {
  return cy
    .get('label')
    .contains(label)
    .invoke('attr', 'for')
    .then((id) => cy.get(`#${id}`));
};
