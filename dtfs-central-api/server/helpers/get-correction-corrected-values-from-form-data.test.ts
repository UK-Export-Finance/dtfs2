import { anEmptyRecordCorrectionTransientFormData } from "@ukef/dtfs2-common/test-helpers";
import { Currency, CURRENCY, RECORD_CORRECTION_REASON, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { getCorrectionCorrectedValuesFromFormData } from './get-correction-corrected-values-from-form-data';

describe('getCorrectionCorrectedValuesFromFormData', () => {
  describe('when the correction reasons include REPORTED_CURRENCY_INCORRECT', () => {
    const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

    it.each`
      reportedCurrency | expectedCurrency | description
      ${CURRENCY.GBP}  | ${CURRENCY.GBP}  | ${'defined'}
      ${null}          | ${null}          | ${'null'}
    `(
      'should set the feesPaidToUkefForThePeriodCurrency to the reportedCurrency form value when reportedCurrency is $description',
      ({ reportedCurrency, expectedCurrency }: { reportedCurrency: Currency; expectedCurrency: Currency }) => {
        // Arrange
        const mockFormData: RecordCorrectionTransientFormData = {
          ...anEmptyRecordCorrectionTransientFormData(),
          reportedCurrency,
        };

        // Act
        const result = getCorrectionCorrectedValuesFromFormData(mockFormData, reasons);

        // Assert
        const expected = {
          feesPaidToUkefForThePeriod: null,
          feesPaidToUkefForThePeriodCurrency: expectedCurrency,
          facilityId: null,
          facilityUtilisation: null,
        };

        expect(result).toEqual(expected);
      },
    );
  });

  describe('when the correction reasons include FACILITY_ID_INCORRECT', () => {
    const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

    it.each`
      facilityId    | expectedFacilityId | description
      ${'12345678'} | ${'12345678'}      | ${'defined'}
      ${null}       | ${null}            | ${'null'}
    `(
      'should set the facilityId to the facilityId form value when facilityId is $description',
      ({ facilityId, expectedFacilityId }: { facilityId: string; expectedFacilityId: string }) => {
        // Arrange
        const mockFormData: RecordCorrectionTransientFormData = {
          ...anEmptyRecordCorrectionTransientFormData(),
          facilityId,
        };

        // Act
        const result = getCorrectionCorrectedValuesFromFormData(mockFormData, reasons);

        // Assert
        const expected = {
          feesPaidToUkefForThePeriod: null,
          feesPaidToUkefForThePeriodCurrency: null,
          facilityId: expectedFacilityId,
          facilityUtilisation: null,
        };

        expect(result).toEqual(expected);
      },
    );
  });

  describe('when the correction reasons include UTILISATION_INCORRECT', () => {
    const reasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];

    it.each`
      utilisation | expectedFacilityUtilisation | description
      ${1000}     | ${1000}                     | ${'defined'}
      ${0}        | ${0}                        | ${'zero'}
      ${null}     | ${null}                     | ${'null'}
    `(
      'should set the facilityUtilisation to the utilisation form value when utilisation is $description',
      ({ utilisation, expectedFacilityUtilisation }: { utilisation: number; expectedFacilityUtilisation: number }) => {
        // Arrange
        const mockFormData: RecordCorrectionTransientFormData = {
          ...anEmptyRecordCorrectionTransientFormData(),
          utilisation,
        };

        // Act
        const result = getCorrectionCorrectedValuesFromFormData(mockFormData, reasons);

        // Assert
        const expected = {
          feesPaidToUkefForThePeriod: null,
          feesPaidToUkefForThePeriodCurrency: null,
          facilityId: null,
          facilityUtilisation: expectedFacilityUtilisation,
        };

        expect(result).toEqual(expected);
      },
    );
  });

  describe('when the correction reasons include REPORTED_FEE_INCORRECT', () => {
    const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

    it.each`
      reportedFee | expectedFeesPaidToUkefForThePeriod | description
      ${500}      | ${500}                             | ${'defined'}
      ${0}        | ${0}                               | ${'zero'}
      ${null}     | ${null}                            | ${'null'}
    `(
      'should set the feesPaidToUkefForThePeriod to the reportedFee form value when reportedFee is $description',
      ({ reportedFee, expectedFeesPaidToUkefForThePeriod }: { reportedFee: number; expectedFeesPaidToUkefForThePeriod: number }) => {
        // Arrange
        const mockFormData: RecordCorrectionTransientFormData = {
          ...anEmptyRecordCorrectionTransientFormData(),
          reportedFee,
        };

        // Act
        const result = getCorrectionCorrectedValuesFromFormData(mockFormData, reasons);

        // Assert
        const expected = {
          feesPaidToUkefForThePeriod: expectedFeesPaidToUkefForThePeriod,
          feesPaidToUkefForThePeriodCurrency: null,
          facilityId: null,
          facilityUtilisation: null,
        };

        expect(result).toEqual(expected);
      },
    );
  });

  describe('when other is the only correction reason', () => {
    it('should return all fields as null', () => {
      // Arrange
      const mockFormData: RecordCorrectionTransientFormData = {
        ...anEmptyRecordCorrectionTransientFormData(),
        additionalComments: 'This record is actually correct',
      };
      const reasons = [RECORD_CORRECTION_REASON.OTHER];

      // Act
      const result = getCorrectionCorrectedValuesFromFormData(mockFormData, reasons);

      // Assert
      const expected = {
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId: null,
        facilityUtilisation: null,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when there are multiple correction reasons', () => {
    it('should set the corrected values for each reason', () => {
      // Arrange
      const mockFormData: RecordCorrectionTransientFormData = {
        reportedCurrency: CURRENCY.GBP,
        facilityId: '12345678',
        utilisation: 1000,
        reportedFee: 500,
        additionalComments: 'Some additional comments',
      };

      const reasons = [
        RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
        RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
        RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
        RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
        RECORD_CORRECTION_REASON.OTHER,
      ];

      // Act
      const result = getCorrectionCorrectedValuesFromFormData(mockFormData, reasons);

      // Assert
      const expected = {
        feesPaidToUkefForThePeriod: mockFormData.reportedFee,
        feesPaidToUkefForThePeriodCurrency: mockFormData.reportedCurrency,
        facilityId: mockFormData.facilityId,
        facilityUtilisation: mockFormData.utilisation,
      };

      expect(result).toEqual(expected);
    });
  });
});
