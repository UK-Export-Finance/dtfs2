/**
 * Gets the last form on the page if any forms are present.
 * The last form is taken as it is foreseeable to have multiple forms on a page,
 * and the submit button should always be in the last form on a page.
 * @returns {HTMLFormElement | null}
 */
const getLastFormIfPresent = () => {
  const forms = document.querySelectorAll('form');

  if (!forms.length) {
    return null;
  }

  const lastForm = forms[forms.length - 1];

  if (!lastForm) {
    return null;
  }

  return lastForm;
};

/**
 * Creates a hidden input of the button used to submit the form.
 * This hidden input has any name or value attributes that the button has
 * as when we disable the initial button, the disabled button will not submit
 * this information to the server.
 * @param {string} selectedButtonId
 */
const createHiddenInputOfSelectedButton = (selectedButtonId) => {
  const attributesToCopy = ['name', 'value'];

  const buttonThatWasClicked = document.getElementById(selectedButtonId);

  const input = document.createElement('input');

  input.setAttribute('type', 'hidden');

  attributesToCopy.forEach((attribute) => {
    const valueToCopy = buttonThatWasClicked.getAttribute(attribute);
    if (valueToCopy) {
      input.setAttribute(attribute, valueToCopy);
    }
  });

  buttonThatWasClicked.append(input);
};

/**
 * Prevents form resubmission by other methods other than clicking on buttons
 * (such as pressing enter on a form field or pressing enter on a button)
 * @param {SubmitEvent} event
 * @param {boolean} hasSubmitted
 */
const preventFormResubmission = (event, hasSubmitted) => {
  if (hasSubmitted) {
    event.preventDefault();
  }
};

/**
 * Disables all govuk buttons on the page.
 * This is to prevent multiple form submissions by clicking on a submit button
 * more than once
 */
const disableAllGovUkButtons = () => {
  const buttons = document.querySelectorAll('.govuk-button');
  buttons.forEach((button) => {
    button.setAttribute('disabled', '');
    button.setAttribute('aria-disabled', 'true');
  });
};

/**
 * Prevent multiple form submissions by pressing enter or clicking the submit button
 * The govukButton component has a preventDoubleClick property, but this only debounces in a one-second window,
 * and is therefore not sufficient for our needs as multiple forms take longer than a second to submit.
 */
const addDisableFormSubmitOnSubmission = () => {
  let hasSubmitted = false;

  const lastForm = getLastFormIfPresent();

  if (lastForm) {
    lastForm.addEventListener('submit', (event) => {
      preventFormResubmission(event, hasSubmitted);
      hasSubmitted = true;

      createHiddenInputOfSelectedButton(event.submitter.id);

      disableAllGovUkButtons();
    });
  }
};

addDisableFormSubmitOnSubmission();
