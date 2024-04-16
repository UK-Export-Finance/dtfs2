// Prevent multiple form submissions by pressing enter or clicking the submit button
// The govukButton component has a preventDoubleClick property, but this only debounces in a one-second window,
// and is therefore not sufficient for our needs as multiple forms take longer than a second to submit.

const addDisableFormOnSubmit = () => {
  const forms = document.querySelectorAll('form');
  // only take the last form on the page, as it is foreseeable to have multiple forms on a page,
  // and the 'continue' button should always be in the last form on a page.
  const lastForm = forms[forms.length - 1];
  
  if (!lastForm) {
    return;
  }

  let hasSubmitted = false;

  lastForm.addEventListener('submit', (e) => {
      if (hasSubmitted) {
        // prevent multiple form submissions by keyboard
        e.preventDefault();
      }
      hasSubmitted = true;

      const buttons = document.querySelectorAll('.govuk-button');
      buttons.forEach((button) => {
        button.setAttribute('disabled', '');
        button.setAttribute('aria-disabled', 'true');
      });
    });
};

addDisableFormOnSubmit();
