export const getElement = (id) => document.getElementById(id);

export const showHideElement = (elementId, showBoolean) => {
  const element = getElement(elementId);

  if (showBoolean) {
    element.className = '';
  } else {
    element.className = 'govuk-visually-hidden';
  }
};

const attachToWindow = () => {
  window.dtfs = {
    ...window.dtfs,
    showHideElement,
  };
};

export default attachToWindow;
