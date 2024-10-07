import { CURRENCY, FeeRecordEntityMockBuilder } from '@ukef/dtfs2-common';
import { calculateExposure, getUtilisationDetails } from './get-utilisation-details';
import { aTfmFacility, aUtilisationReport } from '../../../../../../test-helpers';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { NotFoundError } from '../../../../../errors';
import * as helpers from '../../../../../helpers';

jest.mock('../../../../../repositories/tfm-facilities-repo');
jest.mock('../../../../../helpers');

describe('get-utilisation-details', () => {
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

  describe('getUtilisationDetails', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('throws if no tfm facility is found for one of the fee records', async () => {
      // Arrange
      const facilityId = '12345678';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();
      jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([]);

      // Act + Assert
      await expect(getUtilisationDetails([feeRecord])).rejects.toThrow(
        new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`),
      );
    });

    it('retrieves the cover percentage from the facility snapshot', async () => {
      // Arrange
      const coverPercentage = 80;
      const facilityId = '12345678';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.coverPercentage = coverPercentage;

      const findByUkefFacilityIdsSpy = jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([tfmFacility]);

      // Act
      const utilisationDetails = await getUtilisationDetails([feeRecord]);

      // Assert
      expect(findByUkefFacilityIdsSpy).toHaveBeenCalledTimes(1);
      expect(findByUkefFacilityIdsSpy).toHaveBeenCalledWith([facilityId]);
      expect(utilisationDetails.at(0)?.coverPercentage).toEqual(coverPercentage);
    });

    it('retrieves the value from the facility snapshot when there are no amendments to the value', async () => {
      // Arrange
      const value = 200000;
      const facilityId = '12345678';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.value = value;

      const findByUkefFacilityIdsSpy = jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([tfmFacility]);
      const getLatestCompletedAmendmentFacilityValueSpy = jest.spyOn(helpers, 'getLatestCompletedAmendmentToFacilityValue').mockReturnValue(undefined);

      // Act
      const utilisationDetails = await getUtilisationDetails([feeRecord]);

      // Assert
      expect(findByUkefFacilityIdsSpy).toHaveBeenCalledTimes(1);
      expect(findByUkefFacilityIdsSpy).toHaveBeenCalledWith([facilityId]);
      expect(getLatestCompletedAmendmentFacilityValueSpy).toHaveBeenCalledTimes(1);
      expect(getLatestCompletedAmendmentFacilityValueSpy).toHaveBeenCalledWith(tfmFacility);
      expect(utilisationDetails.at(0)?.value).toEqual(value);
    });

    it('retrieves the value from the facility snapshot when there is an amendement to the value', async () => {
      // Arrange
      const originalValue = 200000;
      const amendedValue = 300000;
      const facilityId = '12345678';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.value = originalValue;

      const findByUkefFacilityIdsSpy = jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([tfmFacility]);
      const getLatestCompletedAmendmentFacilityValueSpy = jest.spyOn(helpers, 'getLatestCompletedAmendmentToFacilityValue').mockReturnValue(amendedValue);

      // Act
      const utilisationDetails = await getUtilisationDetails([feeRecord]);

      // Assert
      expect(findByUkefFacilityIdsSpy).toHaveBeenCalledTimes(1);
      expect(findByUkefFacilityIdsSpy).toHaveBeenCalledWith([facilityId]);
      expect(getLatestCompletedAmendmentFacilityValueSpy).toHaveBeenCalledTimes(1);
      expect(getLatestCompletedAmendmentFacilityValueSpy).toHaveBeenCalledWith(tfmFacility);
      expect(utilisationDetails.at(0)?.value).toEqual(amendedValue);
    });

    it('calculates the exposure from the utilisation and cover percentage', async () => {
      // Arrange
      const facilityId = '12345678';
      const utilisation = 1000;
      const coverPercentage = 60;
      // The expected exposure = 1000 * 60 / 100 = 600
      const expectedExposure = 600;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).withFacilityUtilisation(utilisation).build();

      const tfmFacility = aTfmFacility();
      tfmFacility.facilitySnapshot.ukefFacilityId = facilityId;
      tfmFacility.facilitySnapshot.coverPercentage = coverPercentage;

      jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([tfmFacility]);

      // Act
      const utilisationDetails = await getUtilisationDetails([feeRecord]);

      // Assert
      expect(utilisationDetails.at(0)?.exposure).toEqual(expectedExposure);
    });

    it('sets the facility id, exporter, base currency and utilisation to the corresponding fields on the fee record', async () => {
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

      jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([tfmFacility]);

      // Act
      const utilisationDetails = await getUtilisationDetails([feeRecord]);

      // Assert
      expect(utilisationDetails.at(0)?.facilityId).toEqual(facilityId);
      expect(utilisationDetails.at(0)?.exporter).toEqual(exporter);
      expect(utilisationDetails.at(0)?.baseCurrency).toEqual(baseCurrency);
      expect(utilisationDetails.at(0)?.utilisation).toEqual(utilisation);
    });

    it("sets fees accrued to the fee record's total fees accrued for the period", async () => {
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

      jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([tfmFacility]);

      // Act
      const utilisationDetails = await getUtilisationDetails([feeRecord]);

      // Assert
      expect(utilisationDetails.at(0)?.feesAccrued).toEqual({ currency: totalFeesAccruedForThePeriodCurrency, amount: totalFeesAccruedForThePeriod });
    });

    it("sets fees payable to the fee record's fees paid to ukef for the period", async () => {
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

      jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([tfmFacility]);

      // Act
      const utilisationDetails = await getUtilisationDetails([feeRecord]);

      // Assert
      expect(utilisationDetails.at(0)?.feesPayable).toEqual({ currency: feesPaidToUkefForThePeriodCurrency, amount: feesPaidToUkefForThePeriod });
    });

    it('returns one utilisation data object for each fee record', () => {});
  });
});
