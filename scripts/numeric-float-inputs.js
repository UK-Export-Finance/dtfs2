const hasDecimalPlaces = str => str.indexOf('.') >= 0

// return string with only 2 decimal places
const trimDecimalPlaces = str => (str.substr(0, str.indexOf('.')) + str.substr(str.indexOf('.'), 3))

const handleDecimalPlaces = str => {
  if (hasDecimalPlaces) {
    return trimDecimalPlaces(str);
  }
}

// add event listeners to a HTML input
// on change, only allow 2 decimal places and filter out non-numeric characters
const setInputFilter = (input, inputFilter) => {
  ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'].forEach((event) => {
    input.addEventListener(event, function () {
      if (this.value) {
        this.value = handleDecimalPlaces(this.value);
      }

      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty('oldValue')) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = '';
      }
    });
  });
}

// get all HTML inputs with `numeric float` class
// apply a filter to each input, to filter out non-numeric characters
const numericFloatInputs = () => {
  const numericFloatInputs = document.getElementsByClassName('input--numeric-float');

  if (numericFloatInputs) {
    Array.from(numericFloatInputs).forEach((element) => {
      setInputFilter(element, (value) => {
        return /^-?\d*[.,]?\d*$/.test(value);
      });
    });
  }
}

export default numericFloatInputs;
