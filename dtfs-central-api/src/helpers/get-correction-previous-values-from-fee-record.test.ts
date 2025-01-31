import { CURRENCY, FeeRecordEntityMockBuilder, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { getCorrectionPreviousValuesFromFeeRecord } from './get-correction-previous-values-from-fee-record';

describe('getCorrectionPreviousValuesFromFeeRecord', () => {
  describe('when the correction reasons include REPORTED_CURRENCY_INCORRECT', () => {
    const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT];

    it('should set the feesPaidToUkefForThePeriodCurrency to the feesPaidToUkefForThePeriodCurrency fee record value', () => {
      // Arrange
      const feesPaidToUkefForThePeriodCurrency = CURRENCY.GBP;
      const feeRecord = new FeeRecordEntityMockBuilder().withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency).build();

      // Act
      const result = getCorrectionPreviousValuesFromFeeRecord(feeRecord, reasons);

      // Assert
      const expected = {
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency,
        facilityId: null,
        facilityUtilisation: null,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the correction reasons include FACILITY_ID_INCORRECT', () => {
    const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

    it('should set the facilityId to the facilityId fee record value when facilityId is defined', () => {
      // Arrange
      const facilityId = '12345678';
      const feeRecord = new FeeRecordEntityMockBuilder().withFacilityId(facilityId).build();

      // Act
      const result = getCorrectionPreviousValuesFromFeeRecord(feeRecord, reasons);

      // Assert
      const expected = {
        feesPaidToUkefForThePeriod: null,
        feesPaidToUkefForThePeriodCurrency: null,
        facilityId,
        facilityUtilisation: null,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the correction reasons include UTILISATION_INCORRECT', () => {
    const reasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT];

    it.each`
      facilityUtilisation | expectedFacilityUtilisation | description
      ${1000}             | ${1000}                     | ${'greater than zero'}
      ${0}                | ${0}                        | ${'zero'}
    `(
      'should set the facilityUtilisation to the facilityUtilisation fee record value when facilityUtilisation is $description',
      ({ facilityUtilisation, expectedFacilityUtilisation }: { facilityUtilisation: number; expectedFacilityUtilisation: number }) => {
        // Arrange
        const feeRecord = new FeeRecordEntityMockBuilder().withFacilityUtilisation(facilityUtilisation).build();

        // Act
        const result = getCorrectionPreviousValuesFromFeeRecord(feeRecord, reasons);

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
      feesPaidToUkefForThePeriod | expectedFeesPaidToUkefForThePeriod | description
      ${500}                     | ${500}                             | ${'greater than zero'}
      ${0}                       | ${0}                               | ${'zero'}
    `(
      'should set the feesPaidToUkefForThePeriod to the feesPaidToUkefForThePeriod fee record value when feesPaidToUkefForThePeriod is $description',
      ({
        feesPaidToUkefForThePeriod,
        expectedFeesPaidToUkefForThePeriod,
      }: {
        feesPaidToUkefForThePeriod: number;
        expectedFeesPaidToUkefForThePeriod: number;
      }) => {
        // Arrange
        const feeRecord = new FeeRecordEntityMockBuilder().withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod).build();

        // Act
        const result = getCorrectionPreviousValuesFromFeeRecord(feeRecord, reasons);

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
      const feeRecord = new FeeRecordEntityMockBuilder().build();
      const reasons = [RECORD_CORRECTION_REASON.OTHER];

      // Act
      const result = getCorrectionPreviousValuesFromFeeRecord(feeRecord, reasons);

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
    it('should set the previous values for each reason', () => {
      // Arrange
      const feesPaidToUkefForThePeriodCurrency = CURRENCY.GBP;
      const facilityId = '12345678';
      const facilityUtilisation = 1000;
      const feesPaidToUkefForThePeriod = 500;

      const feeRecord = new FeeRecordEntityMockBuilder()
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withFacilityId(facilityId)
        .withFacilityUtilisation(facilityUtilisation)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .build();

      const reasons = [
        RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
        RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT,
        RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
        RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
        RECORD_CORRECTION_REASON.OTHER,
      ];

      // Act
      const result = getCorrectionPreviousValuesFromFeeRecord(feeRecord, reasons);

      // Assert
      const expected = {
        feesPaidToUkefForThePeriod,
        feesPaidToUkefForThePeriodCurrency,
        facilityId,
        facilityUtilisation,
      };

      expect(result).toEqual(expected);
    });
  });
});
