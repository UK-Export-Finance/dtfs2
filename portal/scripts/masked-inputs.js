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
      element.setAttribute('aria-live', 'assertive');
      IMask(element, maskOptions);
    });
  });
};

export default maskedInputs;
