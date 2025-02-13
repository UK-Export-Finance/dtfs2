import { In } from 'typeorm';
import { when } from 'jest-when';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  FeeRecordPaymentJoinTableEntity,
  FeeRecordStatus,
  KEYING_SHEET_ROW_STATUS,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { getKeyingSheetForReportId } from './get-keying-sheet-for-report-id';

jest.mock('@ukef/dtfs2-common/sql-db-connection', () => ({
  SqlDbDataSource: {
    manager: {
      find: jest.fn(),
    },
  },
}));

describe('getKeyingSheetForReportId', () => {
  const mockFind = jest.spyOn(SqlDbDataSource.manager, 'find');

  beforeEach(() => {
    mockFind.mockRejectedValue('Some error');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a keying sheet row for each unique fee record in the join table', async () => {
    // Arrange
    const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(11).build();
    const secondPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(22).build();
    const thirdPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(33).build();

    const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withId(12)
      .build();
    const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withId(24)
      .build();

    const joinTableEntities = [
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord: firstFeeRecord, payment: firstPayment, paymentAmountUsedForFeeRecord: 1 }),
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord: firstFeeRecord, payment: secondPayment, paymentAmountUsedForFeeRecord: 1 }),
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord: secondFeeRecord, payment: thirdPayment, paymentAmountUsedForFeeRecord: 1 }),
    ];

    const reportId = 1;
    when(mockFind)
      .calledWith(FeeRecordPaymentJoinTableEntity, {
        where: {
          feeRecord: {
            report: { id: reportId },
            status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
          },
        },
        relations: {
          feeRecord: true,
          payment: true,
        },
      })
      .mockResolvedValue(joinTableEntities);

    // Act
    const keyingSheet = await getKeyingSheetForReportId(reportId, [firstFeeRecord, secondFeeRecord]);

    // Assert
    expect(keyingSheet).toHaveLength(2);
  });

  it('maps the fee record fields to the keying sheet row', async () => {
    // Arrange
    const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).build();

    const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withId(12)
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withFacilityId('11111111')
      .withExporter('Test exporter 1')
      .withBaseCurrency(CURRENCY.GBP)
      .build();

    const joinTableEntities = [aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment, paymentAmountUsedForFeeRecord: 1 })];

    const reportId = 1;
    when(mockFind)
      .calledWith(FeeRecordPaymentJoinTableEntity, {
        where: {
          feeRecord: {
            report: { id: reportId },
            status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
          },
        },
        relations: {
          feeRecord: true,
          payment: true,
        },
      })
      .mockResolvedValue(joinTableEntities);

    // Act
    const keyingSheet = await getKeyingSheetForReportId(reportId, [feeRecord]);

    // Assert
    expect(keyingSheet).toHaveLength(1);
    expect(keyingSheet[0].feeRecordId).toEqual(12);
    expect(keyingSheet[0].status).toEqual(KEYING_SHEET_ROW_STATUS.TO_DO);
    expect(keyingSheet[0].facilityId).toEqual('11111111');
    expect(keyingSheet[0].exporter).toEqual('Test exporter 1');
    expect(keyingSheet[0].baseCurrency).toEqual(CURRENCY.GBP);
  });

  it('creates a keying sheet row fee payments item for each payment attached to the same unique fee record in the join table', async () => {
    // Arrange
    const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withId(12)
      .build();
    const firstFeeRecordPayments = [
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(11).build(),
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(12).build(),
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(13).build(),
    ];

    const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withId(13)
      .build();
    const secondFeeRecordPayments = [
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(21).build(),
      PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(22).build(),
    ];

    const joinTableEntities = [
      ...firstFeeRecordPayments.map((payment) =>
        aFeeRecordPaymentJoinTableEntityWith({ feeRecord: firstFeeRecord, payment, paymentAmountUsedForFeeRecord: 1 }),
      ),
      ...secondFeeRecordPayments.map((payment) =>
        aFeeRecordPaymentJoinTableEntityWith({ feeRecord: secondFeeRecord, payment, paymentAmountUsedForFeeRecord: 1 }),
      ),
    ];

    const reportId = 1;
    when(mockFind)
      .calledWith(FeeRecordPaymentJoinTableEntity, {
        where: {
          feeRecord: {
            report: { id: reportId },
            status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
          },
        },
        relations: {
          feeRecord: true,
          payment: true,
        },
      })
      .mockResolvedValue(joinTableEntities);

    // Act
    const keyingSheet = await getKeyingSheetForReportId(reportId, [firstFeeRecord, secondFeeRecord]);

    // Assert
    expect(keyingSheet).toHaveLength(2);
    expect(keyingSheet[0].feePayments).toHaveLength(3);
    expect(keyingSheet[1].feePayments).toHaveLength(2);
  });

  it('sets the keying sheet row fee payment amount to the corresponding join table paymentAmountUsedForFeeRecord', async () => {
    // Arrange
    const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(11).build();
    const secondPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(22).build();
    const thirdPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(33).build();

    const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withId(12)
      .build();

    const joinTableEntities = [
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment: firstPayment, paymentAmountUsedForFeeRecord: 1000 }),
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment: secondPayment, paymentAmountUsedForFeeRecord: 2000 }),
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment: thirdPayment, paymentAmountUsedForFeeRecord: 3000 }),
    ];

    const reportId = 1;
    when(mockFind)
      .calledWith(FeeRecordPaymentJoinTableEntity, {
        where: {
          feeRecord: {
            report: { id: reportId },
            status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
          },
        },
        relations: {
          feeRecord: true,
          payment: true,
        },
      })
      .mockResolvedValue(joinTableEntities);

    // Act
    const keyingSheet = await getKeyingSheetForReportId(reportId, [feeRecord]);

    // Assert
    expect(keyingSheet).toHaveLength(1);
    expect(keyingSheet[0].feePayments).toHaveLength(3);
    expect(keyingSheet[0].feePayments[0].amount).toEqual(1000);
    expect(keyingSheet[0].feePayments[1].amount).toEqual(2000);
    expect(keyingSheet[0].feePayments[2].amount).toEqual(3000);
  });

  it('sets the keying sheet row fee payment currency and date received to the corresponding payment value', async () => {
    // Arrange
    const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(11).withDateReceived(new Date('2021')).build();
    const secondPayment = PaymentEntityMockBuilder.forCurrency('USD').withDateReceived(new Date('2022')).withId(22).build();
    const thirdPayment = PaymentEntityMockBuilder.forCurrency('EUR').withDateReceived(new Date('2023')).withId(33).build();

    const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withId(12)
      .build();

    const joinTableEntities = [
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment: firstPayment, paymentAmountUsedForFeeRecord: 1000 }),
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment: secondPayment, paymentAmountUsedForFeeRecord: 2000 }),
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment: thirdPayment, paymentAmountUsedForFeeRecord: 3000 }),
    ];

    const reportId = 1;
    when(mockFind)
      .calledWith(FeeRecordPaymentJoinTableEntity, {
        where: {
          feeRecord: {
            report: { id: reportId },
            status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
          },
        },
        relations: {
          feeRecord: true,
          payment: true,
        },
      })
      .mockResolvedValue(joinTableEntities);

    // Act
    const keyingSheet = await getKeyingSheetForReportId(reportId, [feeRecord]);

    // Assert
    expect(keyingSheet).toHaveLength(1);
    expect(keyingSheet[0].feePayments).toHaveLength(3);
    expect(keyingSheet[0].feePayments[0].currency).toEqual(CURRENCY.GBP);
    expect(keyingSheet[0].feePayments[0].dateReceived).toEqual(new Date('2021'));
    expect(keyingSheet[0].feePayments[1].currency).toEqual('USD');
    expect(keyingSheet[0].feePayments[1].dateReceived).toEqual(new Date('2022'));
    expect(keyingSheet[0].feePayments[2].currency).toEqual('EUR');
    expect(keyingSheet[0].feePayments[2].dateReceived).toEqual(new Date('2023'));
  });

  it('sets the keying sheet row fee payments only to the payment with a non-null paymentAmountUsedForFeeRecord column', async () => {
    // Arrange
    const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(11).withDateReceived(new Date('2021')).build();
    const secondPayment = PaymentEntityMockBuilder.forCurrency('USD').withId(22).withDateReceived(new Date('2022')).build();

    const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
      .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
      .withId(12)
      .build();

    const joinTableEntities = [
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment: firstPayment, paymentAmountUsedForFeeRecord: 1000 }),
      aFeeRecordPaymentJoinTableEntityWith({ feeRecord, payment: secondPayment, paymentAmountUsedForFeeRecord: null }),
    ];

    const reportId = 1;
    when(mockFind)
      .calledWith(FeeRecordPaymentJoinTableEntity, {
        where: {
          feeRecord: {
            report: { id: reportId },
            status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
          },
        },
        relations: {
          feeRecord: true,
          payment: true,
        },
      })
      .mockResolvedValue(joinTableEntities);

    // Act
    const keyingSheet = await getKeyingSheetForReportId(reportId, [feeRecord]);

    // Assert
    expect(keyingSheet).toHaveLength(1);
    expect(keyingSheet[0].feePayments).toHaveLength(1);
    expect(keyingSheet[0].feePayments[0].currency).toEqual(CURRENCY.GBP);
    expect(keyingSheet[0].feePayments[0].amount).toEqual(1000);
    expect(keyingSheet[0].feePayments[0].dateReceived).toEqual(new Date('2021'));
  });

  describe('when there are fee records with no payments', () => {
    const FEE_RECORD_STATUSES_TO_INCLUDE_IN_KEYING_SHEET: FeeRecordStatus[] = [FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED];

    it.each(FEE_RECORD_STATUSES_TO_INCLUDE_IN_KEYING_SHEET)(
      'sets the fee record fee payment to a zero amount fee payment when a %s fee record has no payments',
      async (status) => {
        // Arrange
        const feeRecordWithoutPayment = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
          .withStatus(status)
          .withPaymentCurrency('EUR')
          .withId(35)
          .build();

        const reportId = 1;
        when(mockFind)
          .calledWith(FeeRecordPaymentJoinTableEntity, {
            where: {
              feeRecord: {
                report: { id: reportId },
                status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
              },
            },
            relations: {
              feeRecord: true,
              payment: true,
            },
          })
          .mockResolvedValue([]);

        // Act
        const keyingSheet = await getKeyingSheetForReportId(reportId, [feeRecordWithoutPayment]);

        // Assert
        expect(keyingSheet).toHaveLength(1);
        expect(keyingSheet[0].feePayments).toHaveLength(1);
        expect(keyingSheet[0].feePayments[0].currency).toEqual('EUR');
        expect(keyingSheet[0].feePayments[0].amount).toEqual(0);
        expect(keyingSheet[0].feePayments[0].dateReceived).toBeNull();
      },
    );

    it.each(difference(Object.values(FEE_RECORD_STATUS), FEE_RECORD_STATUSES_TO_INCLUDE_IN_KEYING_SHEET))(
      'does not include zero amount fee record fee payments for fee records at the %s status',
      async (status) => {
        // Arrange
        const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(11).withDateReceived(new Date('2021')).build();

        const feeRecordWithPayment = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
          .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
          .withId(12)
          .build();
        const feeRecordWithoutPayment = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
          .withStatus(status)
          .withPaymentCurrency('EUR')
          .withId(35)
          .build();

        const allFeeRecords = [feeRecordWithPayment, feeRecordWithoutPayment];

        const joinTableEntities = [
          aFeeRecordPaymentJoinTableEntityWith({ feeRecord: feeRecordWithPayment, payment: firstPayment, paymentAmountUsedForFeeRecord: 1000 }),
        ];

        const reportId = 1;
        when(mockFind)
          .calledWith(FeeRecordPaymentJoinTableEntity, {
            where: {
              feeRecord: {
                report: { id: reportId },
                status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
              },
            },
            relations: {
              feeRecord: true,
              payment: true,
            },
          })
          .mockResolvedValue(joinTableEntities);

        // Act
        const keyingSheet = await getKeyingSheetForReportId(reportId, allFeeRecords);

        // Assert
        expect(keyingSheet).toHaveLength(1);
        expect(keyingSheet[0].feePayments).toHaveLength(1);
        expect(keyingSheet[0].feePayments[0].currency).toEqual(CURRENCY.GBP);
        expect(keyingSheet[0].feePayments[0].dateReceived).toEqual(new Date('2021'));
      },
    );
  });

  describe('when there are fee records with multiple payments that have no entry in the join table', () => {
    it('sets the keying sheet fee payments to a single zero amount keying sheet fee payment', async () => {
      // Arrange
      const payments = [
        PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(1000).build(),
        PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(1000).build(),
        PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(1000).build(),
      ];
      const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build())
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .withPayments(payments)
        .build();

      const reportId = 123;
      when(mockFind)
        .calledWith(FeeRecordPaymentJoinTableEntity, {
          where: {
            feeRecord: {
              report: { id: reportId },
              status: In<FeeRecordStatus>([FEE_RECORD_STATUS.READY_TO_KEY, FEE_RECORD_STATUS.RECONCILED]),
            },
          },
          relations: {
            feeRecord: true,
            payment: true,
          },
        })
        .mockResolvedValue([]);

      // Act
      const keyingSheet = await getKeyingSheetForReportId(reportId, [feeRecord]);

      // Assert
      expect(keyingSheet).toHaveLength(1);
      expect(keyingSheet[0].feePayments).toHaveLength(1);
      expect(keyingSheet[0].feePayments[0].currency).toEqual(CURRENCY.GBP);
      expect(keyingSheet[0].feePayments[0].dateReceived).toBeNull();
      expect(keyingSheet[0].feePayments[0].amount).toEqual(0);
    });
  });

  function aFeeRecordPaymentJoinTableEntityWith({
    feeRecordId,
    feeRecord,
    paymentId,
    payment,
    paymentAmountUsedForFeeRecord,
  }: Partial<FeeRecordPaymentJoinTableEntity>): FeeRecordPaymentJoinTableEntity {
    const data = new FeeRecordPaymentJoinTableEntity();
    data.feeRecordId = feeRecordId ?? 1;
    data.paymentId = paymentId ?? 1;
    data.paymentAmountUsedForFeeRecord = paymentAmountUsedForFeeRecord ?? null;
    if (feeRecord) {
      data.feeRecord = feeRecord;
      data.feeRecordId = feeRecord.id;
    }
    if (payment) {
      data.payment = payment;
      data.paymentId = payment.id;
    }
    return data;
  }
});
