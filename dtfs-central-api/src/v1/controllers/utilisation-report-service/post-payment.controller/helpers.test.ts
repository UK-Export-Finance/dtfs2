import { ObjectId } from 'mongodb';
import { In, EntityManager } from 'typeorm';
import {
  Currency,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  REQUEST_PLATFORM_TYPE,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { addPaymentToUtilisationReport } from './helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { InvalidPayloadError, NotFoundError } from '../../../../errors';
import { TfmSessionUser } from '../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { NewPaymentDetails } from '../../../../types/utilisation-reports';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../../../services/state-machines/utilisation-report/event/utilisation-report.event-type';

jest.mock('../../../../helpers');
jest.mock('../../../../repositories/fee-record-repo');

describe('post-add-payment.controller helpers', () => {
  describe('addPaymentToUtilisationReport', () => {
    const reportId = 1;
    const feeRecordIds = [1, 2, 3];
    const paymentCurrency: Currency = 'GBP';

    const tfmUser: TfmSessionUser = {
      ...aTfmSessionUser(),
      _id: new ObjectId().toString(),
    };
    const tfmUserId = tfmUser._id;

    const newPaymentDetails: NewPaymentDetails = {
      currency: paymentCurrency,
      amount: 100,
      dateReceived: new Date(),
      reference: 'A payment reference',
    };

    const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();
    const utilisationReportStateMachine = UtilisationReportStateMachine.forReport(utilisationReport);

    const feeRecordsInPaymentCurrency = feeRecordIds.map((feeRecordId) =>
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(feeRecordId).withPaymentCurrency(paymentCurrency).build(),
    );

    const feeRecordFindBySpy = jest.spyOn(FeeRecordRepo, 'findBy');

    const utilisationReportStateMachineConstructorSpy = jest.spyOn(UtilisationReportStateMachine, 'forReportId');
    const handleEventSpy = jest.spyOn(utilisationReportStateMachine, 'handleEvent');

    const mockEntityManager = {
      save: jest.fn(),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
    } as unknown as EntityManager;

    const feeRecordFindOneByOrFailSpy = jest.spyOn(mockEntityManager, 'findOneByOrFail');

    beforeEach(() => {
      feeRecordFindBySpy.mockResolvedValue(feeRecordsInPaymentCurrency);
      utilisationReportStateMachineConstructorSpy.mockResolvedValue(utilisationReportStateMachine);
      handleEventSpy.mockResolvedValue(utilisationReport);
      feeRecordFindOneByOrFailSpy.mockResolvedValue(FeeRecordEntityMockBuilder.forReport(utilisationReport).build());

      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
        return await functionToExecute(mockEntityManager);
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('initialises a utilisation report state machine with the supplied report id', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(utilisationReportStateMachineConstructorSpy).toHaveBeenCalledWith(reportId);
    });

    it('attempts to find all the fee records which have the id specified by the supplied feeRecordIds list', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(feeRecordFindBySpy).toHaveBeenCalledWith({ id: In(feeRecordIds) });
    });

    it("throws the 'NotFoundError' if no fee records are found", async () => {
      // Arrange
      feeRecordFindBySpy.mockResolvedValue([]);

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails)).rejects.toThrow(NotFoundError);
    });

    it("throws the 'InvalidPayloadError' if the payment currency does not match the fee record payment currencies", async () => {
      // Arrange
      const feeRecordsWithGBPPaymentCurrency = feeRecordIds.map((feeRecordId) =>
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(feeRecordId).withPaymentCurrency('GBP').build(),
      );
      feeRecordFindBySpy.mockResolvedValue(feeRecordsWithGBPPaymentCurrency);

      const newPaymentDetailsWithEURCurrency: NewPaymentDetails = {
        ...newPaymentDetails,
        currency: 'EUR',
      };

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetailsWithEURCurrency)).rejects.toThrow(InvalidPayloadError);
    });

    it("throws the 'InvalidPayloadError' if the payment currency matches all but one of the fee record payment currencies", async () => {
      // Arrange
      const feeRecordsWithGBPPaymentCurrency = feeRecordIds.map((feeRecordId) =>
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(feeRecordId).withPaymentCurrency('GBP').build(),
      );
      const feeRecordWithEURPaymentCurrency = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(100).withPaymentCurrency('EUR').build();
      feeRecordFindBySpy.mockResolvedValue([...feeRecordsWithGBPPaymentCurrency, feeRecordWithEURPaymentCurrency]);

      const newPaymentDetailsWithGBPCurrency: NewPaymentDetails = {
        ...newPaymentDetails,
        currency: 'GBP',
      };

      // Act / Assert
      await expect(addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetailsWithGBPCurrency)).rejects.toThrow(InvalidPayloadError);
    });

    it('adds the payment to the utilisation report using the utilisation report state machine', async () => {
      // Act
      await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(handleEventSpy).toHaveBeenCalledWith({
        type: UTILISATION_REPORT_EVENT_TYPE.ADD_A_PAYMENT,
        payload: {
          transactionEntityManager: mockEntityManager,
          feeRecords: feeRecordsInPaymentCurrency,
          paymentDetails: newPaymentDetails,
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.TFM,
            userId: tfmUserId,
          },
        },
      });
    });

    it('returns the status of the fee record the payment was added to', async () => {
      // Arrange
      feeRecordFindOneByOrFailSpy.mockResolvedValue(
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).build(),
      );

      // Act
      const feeRecordStatus = await addPaymentToUtilisationReport(reportId, feeRecordIds, tfmUser, newPaymentDetails);

      // Assert
      expect(feeRecordStatus).toEqual(FEE_RECORD_STATUS.DOES_NOT_MATCH);
    });
  });
});
