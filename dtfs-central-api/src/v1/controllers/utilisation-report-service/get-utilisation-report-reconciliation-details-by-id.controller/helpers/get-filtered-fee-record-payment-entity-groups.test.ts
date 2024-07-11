import {
  FeeRecordEntityMockBuilder,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { getFilteredFeeRecordPaymentEntityGroups } from './get-filtered-fee-record-payment-entity-groups';
import { FeeRecordPaymentEntityGroup } from '../../../../../helpers';

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  describe('getFilteredFeeRecordPaymentEntityGroups', () => {
    const feeRecordIdGenerator = idGenerator();

    const aFeeRecordWithFacilityIdAndPayments = (facilityId: string, payments: PaymentEntity[]) =>
      FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
        .withId(feeRecordIdGenerator.next().value)
        .withFacilityId(facilityId)
        .withPayments(payments)
        .build();

    const firstPayments = [PaymentEntityMockBuilder.forCurrency('GBP').withId(1).build()];
    const secondPayments = [PaymentEntityMockBuilder.forCurrency('GBP').withId(2).build(), PaymentEntityMockBuilder.forCurrency('GBP').withId(3).build()];

    const firstFeeRecords = [
      aFeeRecordWithFacilityIdAndPayments('11111111', firstPayments),
      aFeeRecordWithFacilityIdAndPayments('22222222', firstPayments),
      aFeeRecordWithFacilityIdAndPayments('44444444', firstPayments),
    ];

    const secondFeeRecords = [aFeeRecordWithFacilityIdAndPayments('33333333', secondPayments), aFeeRecordWithFacilityIdAndPayments('55555555', secondPayments)];

    const allFeeRecords = [...firstFeeRecords, ...secondFeeRecords];

    const firstFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
      feeRecords: firstFeeRecords,
      payments: firstPayments,
    };

    const secondFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
      feeRecords: secondFeeRecords,
      payments: secondPayments,
    };

    it('returns all the fee record payment groups if the facility id filter is undefined', () => {
      // Arrange
      const facilityIdFilter = undefined;

      // Act
      const result = getFilteredFeeRecordPaymentEntityGroups(allFeeRecords, facilityIdFilter);

      // Assert
      expect(result).toEqual([firstFeeRecordPaymentGroup, secondFeeRecordPaymentGroup]);
    });

    it('returns the group where the supplied facility id filter matches one of the fee records in a group', () => {
      // Arrange
      const facilityIdFilter = firstFeeRecords[0].facilityId;

      // Act
      const result = getFilteredFeeRecordPaymentEntityGroups(allFeeRecords, facilityIdFilter);

      // Assert
      expect(result).toContainEqual(firstFeeRecordPaymentGroup);
      expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
    });

    it('returns the group where the supplied facility id filter partially matches a facility id in the group', () => {
      // Arrange
      const facilityIdFilter = '1111'; // corresponds to firstFeeRecords[0].facilityId

      // Act
      const result = getFilteredFeeRecordPaymentEntityGroups(allFeeRecords, facilityIdFilter);

      // Assert
      expect(result).toContainEqual(firstFeeRecordPaymentGroup);
      expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
    });

    it('returns all groups which have a facility id which partially matches the supplied facility id filter', () => {
      // Arrange
      const anotherPayments = [PaymentEntityMockBuilder.forCurrency('GBP').withId(15).build()];
      const anotherFeeRecords = [
        FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withId(feeRecordIdGenerator.next().value)
          .withFacilityId('11112222') // partially matches firstFeeRecords[0].facilityId
          .withPayments(anotherPayments)
          .build(),
      ];

      const facilityIdFilter = '1111';

      // Act
      const result = getFilteredFeeRecordPaymentEntityGroups([...allFeeRecords, ...anotherFeeRecords], facilityIdFilter);

      // Assert
      expect(result).toContainEqual(firstFeeRecordPaymentGroup);
      expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
      expect(result).toContainEqual<FeeRecordPaymentEntityGroup>({
        feeRecords: anotherFeeRecords,
        payments: anotherPayments,
      });
    });

    function aUtilisationReport(): UtilisationReportEntity {
      return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
    }

    function* idGenerator(): Generator<number, number, unknown> {
      let id = 0;
      while (true) {
        id += 1;
        yield id;
      }
    }
  });
});
