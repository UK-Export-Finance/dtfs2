function validateFacilityValue({ interestPercentage, coverPercentage }, saveAndReturn = false) {
  const facilityValueErrors = [];
  // Regex tests to see if value between 1 and 80
  const oneToEightyRegex = /^(?:[1-9]|[1-7][0-9]|80)$/;
  // Regex tests to see if value is between 0 and 100. Also allows for 4 decimal places ie. 20.1234
  const zeroToOneHundredRegex = /^(\d{1,2}(\.\d{1,4})?|100(\.00?)?)$/;

  const coverPercentageError = {
    errRef: 'coverPercentage',
    errMsg: 'You can only enter a number between 1 and 80',
  };
  const interestPercentageError = {
    errRef: 'interestPercentage',
    errMsg: 'You can only enter a number between 0 and 99 and can have up to 4 decimal places',
  };
  if (saveAndReturn) {
    if (coverPercentage && !oneToEightyRegex.test(coverPercentage)) {
      facilityValueErrors.push(coverPercentageError);
    }
    if (interestPercentage && !zeroToOneHundredRegex.test(interestPercentage)) {
      facilityValueErrors.push(interestPercentageError);
    }
  } else {
    if (!oneToEightyRegex.test(coverPercentage)) {
      facilityValueErrors.push(coverPercentageError);
    }
    if (!zeroToOneHundredRegex.test(interestPercentage)) {
      facilityValueErrors.push(interestPercentageError);
    }
  }
  return facilityValueErrors;
}
module.exports = validateFacilityValue;
