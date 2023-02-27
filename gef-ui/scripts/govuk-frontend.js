import { initAll } from 'govuk-frontend';

export default initAll({
  // govuk-button
  button: {
    // Mitigates duplicate execution when clicked twice
    preventDoubleClick: true,
  },
});
