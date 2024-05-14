const hideIfJsNotEnabledClassName = 'hide-if-js-not-enabled';

const removeHideIfJsNotEnabledClass = () => {
  const hiddenElements = document.getElementsByClassName(hideIfJsNotEnabledClassName);
  while (hiddenElements.length !== 0) {
    hiddenElements.item(0).classList.remove(hideIfJsNotEnabledClassName);
  }
};

removeHideIfJsNotEnabledClass();
