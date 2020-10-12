import IMask from 'imask';

var masks = [
  {
    maskname: 'currency',
    maskOptions: {
      mask: Number,
      signed: false,
      radix: '.',
      thousandsSeparator: ',',
      padFractionalZeros: true,
    },
  },
];

// get all HTML inputs with `numeric currency` class
// apply a filter to each input, to filter out non-numeric characters
var maskedInputs = function () {
  // masks.forEach(({ maskname, maskOptions }) => {
    masks.forEach(function(mask) {
    var maskname = mask.maskname;
    var maskOptions = mask.maskOptions;

    // var element = 'data-mask=' + '"' + maskname + '"';
    // var element = '[data-mask=' + '"' + maskname + '"' + ']';

      var element = "[data-mask='" + maskname + "']";
      console.log('element is... ', element);

    var inputs = document.querySelectorAll(element);

    // inputs.forEach(function (element) {
    Array.prototype.forEach.call(inputs, function(element) {
      if (element.innerText) {
        var maskPipe = IMask.createPipe(maskOptions);
        element.innerText = maskPipe(element.innerText); // eslint-disable-line no-param-reassign
        return;
      }

      element.setAttribute('aria-live', 'assertive');
      IMask(element, maskOptions);
    });
  });
};

maskedInputs();
