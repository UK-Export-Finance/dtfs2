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

  return lastForm || null;
};

const validateAndDeleteElement = (elementToDelete) => {
  if (elementToDelete instanceof HTMLElement) {
    elementToDelete.remove();
  }
};

const validateAndDisableSubmitter = (submitter) => {
  if (submitter instanceof HTMLElement) {
    submitter.setAttribute('disabled', '');
    submitter.setAttribute('aria-disabled', 'true');
  }
};

const validateAndEnableSubmitter = (submitter) => {
  if (submitter instanceof HTMLElement) {
    submitter.removeAttribute('disabled');
    submitter.removeAttribute('aria-disabled');
  }
};

/**
 * Creates a hidden input of the submitter used to submit the form.
 * This hidden input copies any name or value attributes that the submission submitter has,
 * as when we disable the initial submitter, the disabled submitter will not submit
 * this information to the server.
 * @param {HTMLElement} submitter
 */
const createHiddenInputOfSubmitter = (submitter) => {
  const hiddenInput = document.createElement('input');

  hiddenInput.setAttribute('id', 'resubmit-prevention-hidden-input');
  hiddenInput.setAttribute('type', 'hidden');

  ['name', 'value'].forEach((attribute) => {
    const value = submitter.getAttribute(attribute);

    if (value) {
      hiddenInput.setAttribute(attribute, value);
    }
  });

  hiddenInput.classList.add('js-hidden-input');

  submitter.after(hiddenInput);

  return hiddenInput;
};

/**
 * Adds an event listener to disable form resubmission using the same submitter.
 *
 * This intentionally does not disable all buttons on the form on submission, but can be updated to do so if
 * issues regarding double submissions are not resolved.
 * @returns {void}
 */
const addDisableFormSubmitOnSubmission = () => {
  const lastForm = getLastFormIfPresent();

  if (!lastForm) {
    return;
  }

  let priorSubmitter = null;
  let priorSubmitterHiddenInput = null;

  lastForm.addEventListener('submit', (event) => {
    const { submitter } = event;

    if (!(submitter instanceof HTMLElement)) {
      return;
    }

    const hasPreviouslySubmitted = !!priorSubmitter;
    if (hasPreviouslySubmitted) {
      const isSameSubmitterAsPrevious = submitter === priorSubmitter;
      if (isSameSubmitterAsPrevious) {
        // prevents a duplicate resubmission if a user resubmits the form not using buttons
        // ie from using keyboard navigation to submit the form
        event.preventDefault();
        return;
      }
      validateAndDeleteElement(priorSubmitterHiddenInput);
      validateAndEnableSubmitter(priorSubmitter);
    }

    validateAndDisableSubmitter(submitter);
    const hiddenInputElement = createHiddenInputOfSubmitter(submitter);

    priorSubmitter = submitter;
    priorSubmitterHiddenInput = hiddenInputElement;
  });
};

addDisableFormSubmitOnSubmission();
