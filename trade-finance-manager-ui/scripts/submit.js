const submitForm = (element) => element.form.submit();
export default submitForm;

/**
 * Event handlers are added where strict CSP is not enforced.
 */

// 1. TFM UI - Activities and comments section
const filters = document.getElementsByName('filterType');

if (filters) {
  filters.forEach((filter) => {
    filter.addEventListener('change', (event) => {
      submitForm(event.target);
    });
  });
}
