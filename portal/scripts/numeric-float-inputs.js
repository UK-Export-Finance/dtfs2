export const hasDecimalPlaces = (str) => str.indexOf('.') >= 1;

// return string with only 2 decimal places
export const trimDecimalPlaces = (str) => (str.substr(0, str.indexOf('.')) + str.substr(str.indexOf('.'), 3));

export const handleDecimalPlaces = (str) => {
  if (hasDecimalPlaces(str)) {
    return trimDecimalPlaces(str);
  }
  return str;
};

// add event listeners to a HTML input
// on change, only allow 2 decimal places and filter out non-numeric characters
export const setInputFilter = (input, inputFilter) => {
  ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach((event) => {
    input.addEventListener(event, function eventListener() {
      if (this.value) {
        this.value = handleDecimalPlaces(this.value);
      }

      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (Object.prototype.hasOwnProperty.call(this, 'oldValue')) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
    });
  });
};

// get all HTML inputs with `numeric float` class
// apply a filter to each input, to filter out non-numeric characters
export const numericFloatInputs = () => {
  const inputs = document.getElementsByClassName('input--numeric-float');

  if (inputs) {
    Array.from(inputs).forEach((element) => {
      setInputFilter(element, (value) => /^-?\d*[.,]?\d*$/.test(value));
    });
  }
};

export default numericFloatInputs;
