import { validateWhatNeedsToChange } from './validation';

describe('validateWhatNeedsToChange', () => {
  const errorTestCases = [
    {
      description: 'changeCoverEndDate is false and changeFacilityValue is false',
      changeCoverEndDate: false,
      changeFacilityValue: false,
    },
    {
      description: 'changeCoverEndDate is undefined and changeFacilityValue is undefined',
      changeCoverEndDate: undefined,
      changeFacilityValue: undefined,
    },
    {
      description: 'changeCoverEndDate is false and changeFacilityValue is undefined',
      changeCoverEndDate: false,
      changeFacilityValue: undefined,
    },
    {
      description: 'changeCoverEndDate is undefined and changeFacilityValue is false',
      changeCoverEndDate: undefined,
      changeFacilityValue: false,
    },
  ];

  it.each(errorTestCases)('should return the correct error when $description', ({ changeCoverEndDate, changeFacilityValue }) => {
    // Act
    const result = validateWhatNeedsToChange({ changeCoverEndDate, changeFacilityValue });

    // Assert
    const expectedErrRef = 'amendmentOptions';
    const expectedErrMsg = 'Select if you need to change the facility cover end date, value or both';

    const expectedError = {
      errRef: expectedErrRef,
      errMsg: expectedErrMsg,
    };

    expect(result).toEqual(expectedError);
  });

  const successTestCases = [
    {
      description: 'changeCoverEndDate is true and changeFacilityValue is false',
      changeCoverEndDate: true,
      changeFacilityValue: false,
    },
    {
      description: 'changeCoverEndDate is true and changeFacilityValue is undefined',
      changeCoverEndDate: true,
      changeFacilityValue: undefined,
    },
    {
      description: 'changeCoverEndDate is false and changeFacilityValue is true',
      changeCoverEndDate: false,
      changeFacilityValue: true,
    },
    {
      description: 'changeCoverEndDate is undefined and changeFacilityValue is true',
      changeCoverEndDate: undefined,
      changeFacilityValue: true,
    },
    {
      description: 'both changeCoverEndDate and changeFacilityValue are true',
      changeCoverEndDate: true,
      changeFacilityValue: true,
    },
  ];

  it.each(successTestCases)('should return null when $description', ({ changeCoverEndDate, changeFacilityValue }) => {
    // Act
    const result = validateWhatNeedsToChange({ changeCoverEndDate, changeFacilityValue });

    // Assert
    expect(result).toEqual(null);
  });
});
