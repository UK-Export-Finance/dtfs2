import { CURRENCY, FeeRecordEntityMockBuilder } from '@ukef/dtfs2-common';
import { aTfmFacility, aUtilisationReport } from '../../../../../../test-helpers';
import { calculateExposure, mapToFeeRecordUtilisation } from './map-to-fee-record-utilisation';
import * as helpers from '../../../../../helpers';

jest.mock('../../../../../helpers');

describe('map-to-fee-record-utilisation', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('calculateExposure', () => {
    it('returns the utilisation multiplied by the cover percentage as a decimal', () => {
      // Arrange
      const utilisation = 200;
      const coverPercentage = 80;

      // Act
      const exposure = calculateExposure(utilisation, coverPercentage);

      // Assert
      // 200 * 80 / 100 = 160
      expect(exposure).toEqual(160);
    });

    it('rounds the exposure to two decimal places', () => {
      // Arrange
      const utilisation = 500000.99;
      const coverPercentage = 85.55;

      // Act
      const exposure = calculateExposure(utilisation, coverPercentage);

      // Assert
      // 500000.99 * 85.55 / 100 = 427750.8469... = 427750.85 to 2.d.p
      expect(exposure).toEqual(427750.85);
    });
  });

  describe('mapToFeeRecordUtilisation', () => {
    it('should set the cover percentage to the corresponding field in the tfm facility', () => {
      // Arrange
      const coverPercentage = 80;
      const facilityId = '12345678';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.coverPercentage = coverPercentage;

      // Act
      const feeRecordUtilisation = mapToFeeRecordUtilisation(feeRecord, tfmFacility);

      // Assert
      expect(feeRecordUtilisation.coverPercentage).toEqual(coverPercentage);
    });

    it('should check for amendments to the facility value', () => {
      // Arrange
      const value = 200000;
      const facilityId = '12345678';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.value = value;

      const getLatestCompletedAmendmentFacilityValueSpy = jest.spyOn(helpers, 'getLatestCompletedAmendmentToFacilityValue').mockReturnValue(null);

      // Act
      mapToFeeRecordUtilisation(feeRecord, tfmFacility);

      // Assert
      expect(getLatestCompletedAmendmentFacilityValueSpy).toHaveBeenCalledTimes(1);
      expect(getLatestCompletedAmendmentFacilityValueSpy).toHaveBeenCalledWith(tfmFacility);
    });

    it('should set the value to the corresponding field in the facility snapshot when there are no amendments to the value', () => {
      // Arrange
      const value = 200000;
      const facilityId = '12345678';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.value = value;

      jest.spyOn(helpers, 'getLatestCompletedAmendmentToFacilityValue').mockReturnValue(null);

      // Act
      const feeRecordUtilisation = mapToFeeRecordUtilisation(feeRecord, tfmFacility);

      // Assert
      expect(feeRecordUtilisation.value).toEqual(value);
    });

    it('should set the value to the latest amended value when there is an amendment to the value', () => {
      // Arrange
      const originalValue = 200000;
      const amendedValue = 300000;
      const facilityId = '12345678';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.value = originalValue;

      jest.spyOn(helpers, 'getLatestCompletedAmendmentToFacilityValue').mockReturnValue(amendedValue);

      // Act
      const feeRecordUtilisation = mapToFeeRecordUtilisation(feeRecord, tfmFacility);

      // Assert
      expect(feeRecordUtilisation.value).toEqual(amendedValue);
    });

    it('should calculate the exposure from the utilisation and cover percentage', () => {
      // Arrange
      const facilityId = '12345678';
      const utilisation = 1000;
      const coverPercentage = 60;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).withFacilityUtilisation(utilisation).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.coverPercentage = coverPercentage;

      // Act
      const feeRecordUtilisation = mapToFeeRecordUtilisation(feeRecord, tfmFacility);

      // Assert
      expect(feeRecordUtilisation.exposure).toEqual(calculateExposure(utilisation, coverPercentage));
    });

    it('should set the facility id, exporter, base currency and utilisation to the corresponding fields on the fee record', () => {
      // Arrange
      const facilityId = '12345678';
      const exporter = 'Company';
      const baseCurrency = CURRENCY.EUR;
      const utilisation = 1000;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withFacilityId(facilityId)
        .withFacilityUtilisation(utilisation)
        .withBaseCurrency(baseCurrency)
        .withExporter(exporter)
        .build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;

      // Act
      const feeRecordUtilisation = mapToFeeRecordUtilisation(feeRecord, tfmFacility);

      // Assert
      expect(feeRecordUtilisation.facilityId).toEqual(facilityId);
      expect(feeRecordUtilisation.exporter).toEqual(exporter);
      expect(feeRecordUtilisation.baseCurrency).toEqual(baseCurrency);
      expect(feeRecordUtilisation.utilisation).toEqual(utilisation);
    });

    it("should set fees accrued to the fee record's total fees accrued for the period", () => {
      // Arrange
      const facilityId = '12345678';
      const totalFeesAccruedForThePeriod = 123.45;
      const totalFeesAccruedForThePeriodCurrency = CURRENCY.EUR;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withFacilityId(facilityId)
        .withTotalFeesAccruedForThePeriod(totalFeesAccruedForThePeriod)
        .withTotalFeesAccruedForThePeriodCurrency(totalFeesAccruedForThePeriodCurrency)
        .withBaseCurrency(CURRENCY.GBP)
        .build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;

      // Act
      const feeRecordUtilisation = mapToFeeRecordUtilisation(feeRecord, tfmFacility);

      // Assert
      expect(feeRecordUtilisation.feesAccrued).toEqual({ currency: totalFeesAccruedForThePeriodCurrency, amount: totalFeesAccruedForThePeriod });
    });

    it("sets fees payable to the fee record's fees paid to ukef for the period", () => {
      // Arrange
      const facilityId = '12345678';
      const feesPaidToUkefForThePeriod = 4444.44;
      const feesPaidToUkefForThePeriodCurrency = CURRENCY.JPY;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withFacilityId(facilityId)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withBaseCurrency(CURRENCY.GBP)
        .build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;

      // Act
      const feeRecordUtilisation = mapToFeeRecordUtilisation(feeRecord, tfmFacility);
      // Assert
      expect(feeRecordUtilisation.feesPayable).toEqual({ currency: feesPaidToUkefForThePeriodCurrency, amount: feesPaidToUkefForThePeriod });
    });
  });
});
