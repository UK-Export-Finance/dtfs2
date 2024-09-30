import { FeeRecordEntityMockBuilder, PaymentEntity, PaymentEntityMockBuilder } from '@ukef/dtfs2-common';
import { ValidatedPaymentDetailsFilters } from '../../../../../types/utilisation-reports';
import { aUtilisationReport, getSqlIdGenerator } from '../../../../../../test-helpers';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';
import {
  filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters,
  filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters,
} from './filter-fee-record-payment-entity-groups';

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  const feeRecordIdGenerator = getSqlIdGenerator();

  const aFeeRecordWithFacilityIdAndPayments = (facilityId: string, payments: PaymentEntity[]) =>
    FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
      .withId(feeRecordIdGenerator.next().value)
      .withFacilityId(facilityId)
      .withPayments(payments)
      .build();

  const firstPayments = [PaymentEntityMockBuilder.forCurrency('GBP').withId(1).withReference('AAAA').build()];
  const secondPayments = [
    PaymentEntityMockBuilder.forCurrency('USD').withId(2).withReference('BBBB').build(),
    PaymentEntityMockBuilder.forCurrency('EUR').withId(3).withReference('CCCC').build(),
  ];

  const firstFeeRecords = [
    aFeeRecordWithFacilityIdAndPayments('11111111', firstPayments),
    aFeeRecordWithFacilityIdAndPayments('22222222', firstPayments),
    aFeeRecordWithFacilityIdAndPayments('44444444', firstPayments),
  ];

  const secondFeeRecords = [aFeeRecordWithFacilityIdAndPayments('33333333', secondPayments), aFeeRecordWithFacilityIdAndPayments('55555555', secondPayments)];

  const firstFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
    feeRecords: firstFeeRecords,
    payments: firstPayments,
  };

  const secondFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
    feeRecords: secondFeeRecords,
    payments: secondPayments,
  };

  const allFeeRecordPaymentGroups = [firstFeeRecordPaymentGroup, secondFeeRecordPaymentGroup];

  describe('filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters', () => {
    it('returns the group where the supplied facility id filter matches one of the fee records in a group', () => {
      // Arrange
      const facilityIdFilter = firstFeeRecords[0].facilityId;
      const premiumPaymentsFilters = { facilityId: facilityIdFilter };

      // Act
      const result = filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters(allFeeRecordPaymentGroups, premiumPaymentsFilters);

      // Assert
      expect(result).toContainEqual(firstFeeRecordPaymentGroup);
      expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
    });

    it('returns the group where the supplied facility id filter partially matches a facility id in the group', () => {
      // Arrange
      const facilityIdFilter = '1111'; // corresponds to firstFeeRecords[0].facilityId
      const premiumPaymentsFilters = { facilityId: facilityIdFilter };

      // Act
      const result = filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters(allFeeRecordPaymentGroups, premiumPaymentsFilters);

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
      const anotherFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
        feeRecords: anotherFeeRecords,
        payments: anotherPayments,
      };

      const facilityIdFilter = '1111';
      const premiumPaymentsFilters = { facilityId: facilityIdFilter };

      // Act
      const result = filterFeeRecordPaymentEntityGroupsByPremiumPaymentsFilters(
        [...allFeeRecordPaymentGroups, anotherFeeRecordPaymentGroup],
        premiumPaymentsFilters,
      );

      // Assert
      expect(result).toContainEqual(firstFeeRecordPaymentGroup);
      expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
      expect(result).toContainEqual(anotherFeeRecordPaymentGroup);
    });
  });

  describe('filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters', () => {
    describe('facility id filter', () => {
      it('returns the group where the supplied facility id filter matches one of the fee records in a group', () => {
        // Arrange
        const facilityIdFilter = firstFeeRecords[0].facilityId;
        const paymentDetailsFilters = { facilityId: facilityIdFilter };

        // Act
        const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(allFeeRecordPaymentGroups, paymentDetailsFilters);

        // Assert
        expect(result).toContainEqual(firstFeeRecordPaymentGroup);
        expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
      });

      it('returns the group where the supplied facility id filter partially matches a facility id in the group', () => {
        // Arrange
        const facilityIdFilter = '1111'; // corresponds to firstFeeRecords[0].facilityId
        const paymentDetailsFilters = { facilityId: facilityIdFilter };

        // Act
        const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(allFeeRecordPaymentGroups, paymentDetailsFilters);

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
        const anotherFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
          feeRecords: anotherFeeRecords,
          payments: anotherPayments,
        };

        const facilityIdFilter = '1111';
        const paymentDetailsFilters = { facilityId: facilityIdFilter };

        // Act
        const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(
          [...allFeeRecordPaymentGroups, anotherFeeRecordPaymentGroup],
          paymentDetailsFilters,
        );

        // Assert
        expect(result).toContainEqual(firstFeeRecordPaymentGroup);
        expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
        expect(result).toContainEqual(anotherFeeRecordPaymentGroup);
      });
    });

    describe('payment currency filter', () => {
      it('returns the group where the supplied payment currency filter matches one of the payments in a group', () => {
        // Arrange
        const paymentCurrencyFilter = secondPayments[0].currency;
        const paymentDetailsFilters = { paymentCurrency: paymentCurrencyFilter };

        // Act
        const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(allFeeRecordPaymentGroups, paymentDetailsFilters);

        // Assert
        expect(result).not.toContainEqual(firstFeeRecordPaymentGroup);
        expect(result).toContainEqual(secondFeeRecordPaymentGroup);
      });

      it('returns all groups which have a payment currency which matches the supplied payment currency filter', () => {
        // Arrange
        const paymentCurrencyFilter = secondPayments[0].currency;

        const anotherPayments = [PaymentEntityMockBuilder.forCurrency(paymentCurrencyFilter).withId(15).build()];
        const anotherFeeRecords = [
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withId(feeRecordIdGenerator.next().value).withPayments(anotherPayments).build(),
        ];
        const anotherFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
          feeRecords: anotherFeeRecords,
          payments: anotherPayments,
        };

        const paymentDetailsFilters = { paymentCurrency: paymentCurrencyFilter };

        // Act
        const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(
          [...allFeeRecordPaymentGroups, anotherFeeRecordPaymentGroup],
          paymentDetailsFilters,
        );

        // Assert
        expect(result).not.toContainEqual(firstFeeRecordPaymentGroup);
        expect(result).toContainEqual(secondFeeRecordPaymentGroup);
        expect(result).toContainEqual(anotherFeeRecordPaymentGroup);
      });
    });

    describe('payment reference filter', () => {
      it('returns the group where the supplied payment reference filter matches one of the fee records in a group', () => {
        // Arrange
        const paymentReferenceFilter = firstPayments[0].reference;
        const paymentDetailsFilters = { paymentReference: paymentReferenceFilter };

        // Act
        const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(allFeeRecordPaymentGroups, paymentDetailsFilters);

        // Assert
        expect(result).toContainEqual(firstFeeRecordPaymentGroup);
        expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
      });

      it('returns the group where the supplied payment reference filter partially matches a payment reference in the group', () => {
        // Arrange
        const paymentReferenceFilter = 'AA'; // corresponds to firstPayments[0].reference
        const paymentDetailsFilters = { paymentReference: paymentReferenceFilter };

        // Act
        const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(allFeeRecordPaymentGroups, paymentDetailsFilters);

        // Assert
        expect(result).toContainEqual(firstFeeRecordPaymentGroup);
        expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
      });

      it('returns all groups which have a payment reference which partially matches the supplied payment reference filter', () => {
        // Arrange
        const anotherPayments = [
          PaymentEntityMockBuilder.forCurrency('GBP')
            .withId(15)
            .withReference('AAAABB') // partially matches firstPayments[0].reference
            .build(),
        ];
        const anotherFeeRecords = [
          FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withId(feeRecordIdGenerator.next().value).withPayments(anotherPayments).build(),
        ];
        const anotherFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
          feeRecords: anotherFeeRecords,
          payments: anotherPayments,
        };

        const paymentReferenceFilter = 'AAAA';
        const paymentDetailsFilters = { paymentReference: paymentReferenceFilter };

        // Act
        const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(
          [...allFeeRecordPaymentGroups, anotherFeeRecordPaymentGroup],
          paymentDetailsFilters,
        );

        // Assert
        expect(result).toContainEqual(firstFeeRecordPaymentGroup);
        expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
        expect(result).toContainEqual(anotherFeeRecordPaymentGroup);
      });
    });

    it('returns all groups which match all supplied filters', () => {
      // Arrange
      const anotherPayments = [
        PaymentEntityMockBuilder.forCurrency('EUR')
          .withId(15)
          .withReference('AAAABB') // partially matches firstPayments[0].reference
          .build(),
      ];
      const anotherFeeRecords = [
        FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withId(feeRecordIdGenerator.next().value)
          .withFacilityId('77772222') // partially matches firstFeeRecords[1].facilityId
          .withPayments(anotherPayments)
          .build(),
      ];
      const anotherFeeRecordPaymentGroup: FeeRecordPaymentEntityGroup = {
        feeRecords: anotherFeeRecords,
        payments: anotherPayments,
      };

      const paymentDetailsFilters: ValidatedPaymentDetailsFilters = {
        facilityId: '2222', // partial matches on all fee record payment groups
        paymentCurrency: 'EUR', // matches all payments in anotherFeeRecordPaymentGroup, and 1/2 payments in secondFeeRecordPaymentGroup
        paymentReference: 'AAA', // matches all payments in firstFeeRecordPaymentGroup and anotherFeeRecordPaymentGroup
      };

      // Act
      const result = filterFeeRecordPaymentEntityGroupsByPaymentDetailsFilters(
        [...allFeeRecordPaymentGroups, anotherFeeRecordPaymentGroup],
        paymentDetailsFilters,
      );

      // Assert
      expect(result).not.toContainEqual(firstFeeRecordPaymentGroup);
      expect(result).not.toContainEqual(secondFeeRecordPaymentGroup);
      expect(result).toContainEqual(anotherFeeRecordPaymentGroup);
    });
  });
});
