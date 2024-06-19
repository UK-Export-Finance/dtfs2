export default (label) => {
  return cy
    .get('label', label)
    .invoke('attr', 'for')
    .then((id) => cy.get(`#${id}`));
};
