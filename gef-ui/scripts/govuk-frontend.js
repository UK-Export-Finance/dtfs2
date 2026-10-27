import { initAll } from 'govuk-frontend';

initAll({
  // govuk-button
  button: {
    // Mitigates duplicate execution when clicked twice
    preventDoubleClick: true,
  },
});
