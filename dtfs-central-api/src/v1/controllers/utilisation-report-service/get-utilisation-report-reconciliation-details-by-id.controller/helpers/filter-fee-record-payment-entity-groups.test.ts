import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  ValidatedPaymentDetailsFilters,
} from '@ukef/dtfs2-common';
import { getSqlIdGenerator } from '../../../../../../test-helpers';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';
import {
  filterFeeRecordPaymentEntityGroups,
  getFacilityIdFilterer,
  getPaymentCurrencyFilterer,
  getPaymentReferenceFilterer,
} from './filter-fee-record-payment-entity-groups';

describe('get-utilisation-report-reconciliation-details-by-id.controller helpers', () => {
  const feeRecordIdGenerator = getSqlIdGenerator();

  const aFeeRecord = () => FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build();

  const aFeeRecordWithFacilityId = (facilityId: string) =>
    FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withId(feeRecordIdGenerator.next().value)
      .withFacilityId(facilityId)
      .build();

  describe('filterFeeRecordPaymentEntityGroups', () => {
    describe('facility id filter', () => {
      describe('when the supplied facility id filter matches one of the fee records in a group', () => {
        it('should return the group with the matching facility id', () => {
          // Arrange
          const firstGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecordWithFacilityId('11111111'), aFeeRecordWithFacilityId('22222222')],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const secondGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecordWithFacilityId('33333333')],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const groups = [firstGroup, secondGroup];

          const facilityIdFilter = '22222222';
          const filters = { facilityId: facilityIdFilter };

          // Act
          const result = filterFeeRecordPaymentEntityGroups(groups, filters);

          // Assert
          expect(result).toEqual([firstGroup]);
        });
      });

      describe('when the supplied facility id filter partially matches a facility id in the group', () => {
        it('should return the group with the partially matching facility id', () => {
          // Arrange
          const firstGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecordWithFacilityId('11111111'), aFeeRecordWithFacilityId('22222222')],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const secondGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecordWithFacilityId('33333333')],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const groups = [firstGroup, secondGroup];

          const facilityIdFilter = '1111';
          const filters = { facilityId: facilityIdFilter };

          // Act
          const result = filterFeeRecordPaymentEntityGroups(groups, filters);

          // Assert
          expect(result).toEqual([firstGroup]);
        });
      });

      describe('when multiple groups have facility ids which partially match the supplied facility id filter', () => {
        it('should return all groups with the partially matching facility id', () => {
          // Arrange
          const firstGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecordWithFacilityId('11111111'), aFeeRecordWithFacilityId('22222222')],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const secondGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecordWithFacilityId('33333333')],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const thirdGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecordWithFacilityId('11112222')],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const groups = [firstGroup, secondGroup, thirdGroup];

          const facilityIdFilter = '1111';
          const filters = { facilityId: facilityIdFilter };

          // Act
          const result = filterFeeRecordPaymentEntityGroups(groups, filters);

          // Assert
          expect(result).toEqual([firstGroup, thirdGroup]);
        });
      });
    });

    describe('payment currency filter', () => {
      describe('when the supplied payment currency filter matches one of the payments in a group', () => {
        it('should return the group with the matching payment currency', () => {
          // Arrange
          const firstGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const secondGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build(), PaymentEntityMockBuilder.forCurrency(CURRENCY.USD).build()],
          };

          const groups = [firstGroup, secondGroup];

          const paymentCurrencyFilter = CURRENCY.USD;
          const filters = { paymentCurrency: paymentCurrencyFilter };

          // Act
          const result = filterFeeRecordPaymentEntityGroups(groups, filters);

          // Assert
          expect(result).toEqual([secondGroup]);
        });
      });

      describe('when multiple groups have a payment currency which matches the supplied payment currency filter', () => {
        it('should return all groups with the matching payment currency', () => {
          // Arrange
          const firstGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build()],
          };

          const secondGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build(), PaymentEntityMockBuilder.forCurrency(CURRENCY.USD).build()],
          };

          const thirdGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.USD).build()],
          };

          const groups = [firstGroup, secondGroup, thirdGroup];

          const paymentCurrencyFilter = CURRENCY.USD;
          const filters = { paymentCurrency: paymentCurrencyFilter };

          // Act
          const result = filterFeeRecordPaymentEntityGroups(groups, filters);

          // Assert
          expect(result).toEqual([secondGroup, thirdGroup]);
        });
      });
    });

    describe('payment reference filter', () => {
      describe('when the supplied payment reference filter matches one of the fee records in a group', () => {
        it('should return the group with the matching payment reference', () => {
          // Arrange
          const firstGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [
              PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('AAAA').build(),
              PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('BBBB').build(),
            ],
          };

          const secondGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('CCCC').build()],
          };

          const groups = [firstGroup, secondGroup];

          const paymentReferenceFilter = 'BBBB';
          const filters = { paymentReference: paymentReferenceFilter };

          // Act
          const result = filterFeeRecordPaymentEntityGroups(groups, filters);

          // Assert
          expect(result).toEqual([firstGroup]);
        });
      });

      describe('when the supplied payment reference filter partially matches a payment reference in the group', () => {
        it('should return the group with the partially matching payment reference', () => {
          // Arrange
          const firstGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('AAAA').build()],
          };

          const secondGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('BBBB').build()],
          };

          const groups = [firstGroup, secondGroup];

          const paymentReferenceFilter = 'AA';
          const filters = { paymentReference: paymentReferenceFilter };

          // Act
          const result = filterFeeRecordPaymentEntityGroups(groups, filters);

          // Assert
          expect(result).toEqual([firstGroup]);
        });
      });

      describe('when multiple groups have a payment reference which partially matches the supplied payment reference filter', () => {
        it('should return all groups matching the partially matching payment reference', () => {
          // Arrange
          const firstGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('AAAA').build()],
          };

          const secondGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('BBBB').build()],
          };

          const thirdGroup: FeeRecordPaymentEntityGroup = {
            feeRecords: [aFeeRecord()],
            payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('AAAABB').build()],
          };

          const groups = [firstGroup, secondGroup, thirdGroup];

          const paymentReferenceFilter = 'AAAA';
          const filters = { paymentReference: paymentReferenceFilter };

          // Act
          const result = filterFeeRecordPaymentEntityGroups(groups, filters);

          // Assert
          expect(result).toEqual([firstGroup, thirdGroup]);
        });
      });
    });

    describe('when applying multiple filters', () => {
      it('should return all groups which match all supplied filters', () => {
        // Arrange
        const firstGroup: FeeRecordPaymentEntityGroup = {
          feeRecords: [aFeeRecordWithFacilityId('11111111')],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('AAAA').build()],
        };

        const secondGroup: FeeRecordPaymentEntityGroup = {
          feeRecords: [aFeeRecordWithFacilityId('22222222')],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('BBBB').build()],
        };

        const thirdGroup: FeeRecordPaymentEntityGroup = {
          feeRecords: [aFeeRecordWithFacilityId('77772222')],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.EUR).withReference('AAAABB').build()],
        };

        const groups = [firstGroup, secondGroup, thirdGroup];

        const filters: ValidatedPaymentDetailsFilters = {
          facilityId: '2222', // partial matches on all fee record payment groups
          paymentCurrency: CURRENCY.EUR, // matches all payments in thirdGroup, and 1/2 payments in secondGroup
          paymentReference: 'AAA', // matches all payments in firstGroup and thirdGroup
        };

        // Act
        const result = filterFeeRecordPaymentEntityGroups(groups, filters);

        // Assert
        expect(result).toEqual([thirdGroup]);
      });
    });
  });

  describe('getFacilityIdFilterer', () => {
    describe('when filtering with a matching facility ID', () => {
      it('should return true for a group with a matching fee record', () => {
        // Arrange
        const facilityIdFilter = '2222';
        const filterer = getFacilityIdFilterer(facilityIdFilter);

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [aFeeRecordWithFacilityId('11111111'), aFeeRecordWithFacilityId('22222222'), aFeeRecordWithFacilityId('33333333')],
          payments: [],
        };

        // Act
        const result = filterer(group);

        // Assert
        expect(result).toEqual(true);
      });
    });

    describe('when filtering with a partial facility ID', () => {
      it('should return true for a group with a partially matching fee record', () => {
        // Arrange
        const facilityIdFilter = '1111';
        const filterer = getFacilityIdFilterer(facilityIdFilter);

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [aFeeRecordWithFacilityId('11111111'), aFeeRecordWithFacilityId('22222222'), aFeeRecordWithFacilityId('33333333')],
          payments: [],
        };

        // Act
        const result = filterer(group);

        // Assert
        expect(result).toEqual(true);
      });
    });

    describe('when filtering with a non-matching facility ID', () => {
      it('should return false for a group without matching fee records', () => {
        // Arrange
        const facilityIdFilter = '4444';
        const filterer = getFacilityIdFilterer(facilityIdFilter);

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [aFeeRecordWithFacilityId('11111111'), aFeeRecordWithFacilityId('22222222'), aFeeRecordWithFacilityId('33333333')],
          payments: [],
        };

        // Act
        const result = filterer(group);

        // Assert
        expect(result).toEqual(false);
      });
    });
  });

  describe('getPaymentCurrencyFilterer', () => {
    describe('when filtering with a matching currency', () => {
      it('should return true for a group with a matching payment', () => {
        // Arrange
        const paymentCurrencyFilter = CURRENCY.USD;
        const filterer = getPaymentCurrencyFilterer(paymentCurrencyFilter);

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [aFeeRecord()],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build(), PaymentEntityMockBuilder.forCurrency(CURRENCY.USD).build()],
        };

        // Act
        const result = filterer(group);

        // Assert
        expect(result).toEqual(true);
      });
    });

    describe('when filtering with a non-matching currency', () => {
      it('should return false for a group without matching payments', () => {
        // Arrange
        const paymentCurrencyFilter = CURRENCY.EUR;
        const filterer = getPaymentCurrencyFilterer(paymentCurrencyFilter);

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [aFeeRecord()],
          payments: [PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build(), PaymentEntityMockBuilder.forCurrency(CURRENCY.USD).build()],
        };

        // Act
        const result = filterer(group);

        // Assert
        expect(result).toEqual(false);
      });
    });
  });

  describe('getPaymentReferenceFilterer', () => {
    describe('when filtering with a matching payment reference', () => {
      it('should return true for a group with a matching payment', () => {
        // Arrange
        const paymentReferenceFilter = 'BBBB';
        const filterer = getPaymentReferenceFilterer(paymentReferenceFilter);

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [],
          payments: [
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('AAAA').build(),
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('BBBB').build(),
          ],
        };

        // Act
        const result = filterer(group);

        // Assert
        expect(result).toEqual(true);
      });
    });

    describe('when filtering with a partial payment reference', () => {
      it('should return true for a group with a partially matching payment', () => {
        // Arrange
        const paymentReferenceFilter = 'AA';
        const filterer = getPaymentReferenceFilterer(paymentReferenceFilter);

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [],
          payments: [
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('AAAA').build(),
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('BBBB').build(),
          ],
        };

        // Act
        const result = filterer(group);

        // Assert
        expect(result).toEqual(true);
      });
    });

    describe('when filtering with a non-matching payment reference', () => {
      it('should return false for a group without matching payments', () => {
        // Arrange
        const paymentReferenceFilter = 'CCCC';
        const filterer = getPaymentReferenceFilterer(paymentReferenceFilter);

        const group: FeeRecordPaymentEntityGroup = {
          feeRecords: [],
          payments: [
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('AAAA').build(),
            PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('BBBB').build(),
          ],
        };

        // Act
        const result = filterer(group);

        // Assert
        expect(result).toEqual(false);
      });
    });
  });
});
