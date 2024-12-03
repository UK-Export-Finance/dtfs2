export const getElement = (id) => document.getElementById(id);

export const changeScreenVisibilityOfElement = (elementId, showBoolean) => {
  const element = getElement(elementId);

  if (showBoolean) {
    element.className = '';
  } else {
    element.className = 'display-none';
  }
};

export const showHideElement = (elementId, showBoolean) => {
  const element = getElement(elementId);

  if (showBoolean) {
    element.removeAttribute('hidden');
  } else {
    element.setAttribute('hidden', true);
  }
};

function showAdditionalFields(bool) {
  const additionalFormFields = document.getElementById('additional-form-fields');

  if (bool) {
    additionalFormFields.className = '';
  } else {
    additionalFormFields.className = 'govuk-visually-hidden';
  }
}

/**
 * Event handlers are added where strict CSP is not enforced.
 */

// 1. Show additional fields `onClick` event handler
let element = document.querySelector('[data-cy="currency-same-as-supply-contract-currency-yes"]');
if (element) {
  element.addEventListener('click', () => {
    showAdditionalFields(false);
  });
}

element = document.querySelector('[data-cy="currency-same-as-supply-contract-currency-no"]');
if (element) {
  element.addEventListener('click', () => {
    showAdditionalFields(true);
  });
}

// 2. Show additional fields `onClick` and `onChange` event handler
element = document.querySelector('[data-cy="autoCreatePassword-true"]');
if (element) {
  document.querySelector('[data-cy="autoCreatePassword-true"]').addEventListener('click', () => {
    changeScreenVisibilityOfElement('manuallyCreatePassword', false);
  });
}

element = document.querySelector('[data-cy="autoCreatePassword-false"]');
if (element) {
  element.addEventListener('click', () => {
    changeScreenVisibilityOfElement('manuallyCreatePassword', true);
  });
}

element = document.querySelector('[data-cy="supplyContractCurrency"]');
if (element) {
  element.addEventListener('change', (event) => {
    changeScreenVisibilityOfElement('supply-contract-currency-conversion-fields', event.target.value !== 'GBP');
  });
}

element = document.querySelector('[data-id="criteria-11-true');
if (element) {
  element.addEventListener('click', () => {
    showHideElement('criterion-group-additional-11', false);
  });
}

element = document.querySelector('[data-id="criteria-11-false"]');
if (element) {
  element.addEventListener('click', () => {
    showHideElement('criterion-group-additional-11', true);
  });
}

element = document.querySelector('[data-cy="legallyDistinct-true"]');
if (element) {
  element.addEventListener('click', () => {
    changeScreenVisibilityOfElement('additional-form-fields-indemnifier', true);
  });
}

element = document.querySelector('[data-cy="legallyDistinct-false"]');
if (element) {
  element.addEventListener('click', () => {
    changeScreenVisibilityOfElement('additional-form-fields-indemnifier', false);
  });
}

element = document.querySelector('[data-cy="indemnifierCorrespondenceAddressDifferent-true"]');
if (element) {
  element.addEventListener('click', () => {
    changeScreenVisibilityOfElement('additional-form-fields-indemnifier-correspondence-address', true);
  });
}

element = document.querySelector('[data-cy="indemnifierCorrespondenceAddressDifferent-false"]');
if (element) {
  element.addEventListener('click', () => {
    changeScreenVisibilityOfElement('additional-form-fields-indemnifier-correspondence-address', false);
  });
}

element = document.querySelector('[data-cy="supplier-correspondence-address-is-different-true"]');
if (element) {
  element.addEventListener('click', () => {
    changeScreenVisibilityOfElement('additional-form-fields-supplier-correspondence', true);
  });
}

element = document.querySelector('[data-cy="supplier-correspondence-address-is-different-false"]');
if (element) {
  element.addEventListener('click', () => {
    changeScreenVisibilityOfElement('additional-form-fields-supplier-correspondence', false);
  });
}

// 3. File upload `onChange` event handler
const fileUpload = document.querySelectorAll("input[type='file'][data-tag='govuk-file-upload']");

if (fileUpload) {
  fileUpload.forEach((input) => {
    input.addEventListener('change', (event) => {
      const file = event.target;
      const id = file.id.concat('-file-upload-button-container');

      changeScreenVisibilityOfElement(id, Boolean(file.value));
    });
  });
}
