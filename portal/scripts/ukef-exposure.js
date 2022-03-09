import { isNumeric, decimalsCount, roundNumber } from './number';
/*
      calculate UKEF Exposure from Facility Value and Covered Percentage
    */

const facilityValueInput = document.getElementById('facilityValue');
const coveredPercentageInput = document.getElementById('coveredPercentage');
const ukefExposureInput = document.getElementById('ukefExposure');

function calculateUkefExposure() {
  const value = facilityValueInput.value.replace(/,/g, ''); // remove commas

  const calculation = value * (coveredPercentageInput.value / 100);

  if (isNumeric(calculation)) {
    let result;
    const totalDecimals = decimalsCount(calculation);
    if (totalDecimals > 2) {
      result = roundNumber(calculation, 2);
    } else {
      result = calculation;
    }

    const formattedResult = result.toLocaleString('en', { minimumFractionDigits: 2 });

    ukefExposureInput.value = formattedResult;
  }
}

if (facilityValueInput && coveredPercentageInput) {
  [facilityValueInput, coveredPercentageInput].forEach((element) => {
    element.addEventListener('blur', () => {
      calculateUkefExposure();
    });
  });
}
