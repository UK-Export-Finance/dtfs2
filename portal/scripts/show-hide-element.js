export const getElement = (id) => document.getElementById(id);

export const changeScreenVisibilityOfElement = (elementId, showBoolean) => {
  const element = getElement(elementId);

  if (showBoolean) {
    element.className = '';
  } else {
    element.className = 'govuk-visually-hidden';
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
