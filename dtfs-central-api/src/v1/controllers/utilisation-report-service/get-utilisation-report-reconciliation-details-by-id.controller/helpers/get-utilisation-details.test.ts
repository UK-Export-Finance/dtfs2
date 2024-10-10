import { CURRENCY, FeeRecordEntityMockBuilder, FeeRecordUtilisation } from '@ukef/dtfs2-common';
import { when } from 'jest-when';
import { getUtilisationDetails } from './get-utilisation-details';
import { aTfmFacility, aUtilisationReport } from '../../../../../../test-helpers';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';
import { NotFoundError } from '../../../../../errors';
import { mapToFeeRecordUtilisation } from './map-to-fee-record-utilisation';

jest.mock('../../../../../repositories/tfm-facilities-repo');
jest.mock('../../../../../helpers');
jest.mock('./map-to-fee-record-utilisation');

describe('get-utilisation-details', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUtilisationDetails', () => {
    describe('when no tfm facility is found for a fee record', () => {
      it('should throw', async () => {
        // Arrange
        const facilityId = '12345678';
        const feeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withFacilityId(facilityId).build();
        jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([]);

        // Act + Assert
        await expect(getUtilisationDetails([feeRecord])).rejects.toThrow(
          new NotFoundError(`Failed to find a tfm facility with ukef facility id '${facilityId}'`),
        );
      });
    });

    describe('when tfm facilities are found for the fee records', () => {
      it('should map each fee record a utilisation details item', async () => {
        // Arrange
        const firstFacilityId = '11111111';
        const secondFacilityId = '22222222';
        const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withId(1).withFacilityId(firstFacilityId).build();
        const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withId(2).withFacilityId(secondFacilityId).build();

        const firstTfmFacility = aTfmFacility();
        firstTfmFacility.facilitySnapshot.ukefFacilityId = firstFacilityId;
        const secondTfmFacility = aTfmFacility();
        secondTfmFacility.facilitySnapshot.ukefFacilityId = secondFacilityId;

        jest.spyOn(TfmFacilitiesRepo, 'findByUkefFacilityIds').mockResolvedValue([firstTfmFacility, secondTfmFacility]);
        const expected: FeeRecordUtilisation[] = [
          {
            feeRecordId: 1,
            facilityId: '12345',
            exporter: 'first exporter',
            baseCurrency: CURRENCY.GBP,
            value: 100,
            utilisation: 200,
            exposure: 300,
            coverPercentage: 80,
            feesAccrued: { currency: CURRENCY.EUR, amount: 500 },
            feesPayable: { currency: CURRENCY.JPY, amount: 600 },
          },
          {
            feeRecordId: 2,
            facilityId: '678910',
            exporter: 'second exporter',
            baseCurrency: CURRENCY.USD,
            value: 1000,
            utilisation: 2000,
            exposure: 3000,
            coverPercentage: 85,
            feesAccrued: { currency: CURRENCY.USD, amount: 5000 },
            feesPayable: { currency: CURRENCY.USD, amount: 6000 },
          },
        ];
        when(mapToFeeRecordUtilisation).calledWith(firstFeeRecord, firstTfmFacility).mockReturnValue(expected[0]);
        when(mapToFeeRecordUtilisation).calledWith(secondFeeRecord, secondTfmFacility).mockReturnValue(expected[1]);

        // Act
        const utilisationDetails = await getUtilisationDetails([firstFeeRecord, secondFeeRecord]);

        // Assert
        expect(utilisationDetails).toHaveLength(2);
        expect(utilisationDetails).toEqual(expected);
      });
    });
  });
});
