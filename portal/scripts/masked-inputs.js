import IMask from 'imask';

const masks = [
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
export const maskedInputs = () => {
  masks.forEach(({ maskname, maskOptions }) => {
    const inputs = document.querySelectorAll(`[data-mask="${maskname}"]`);

    inputs.forEach((element) => {
      if (element.innerText) {
        const maskPipe = IMask.createPipe(maskOptions);
        element.innerText = maskPipe(element.innerText); // eslint-disable-line no-param-reassign
        return;
      }

      element.setAttribute('aria-live', 'assertive');
      IMask(element, maskOptions);
    });
  });
};

export default maskedInputs;
