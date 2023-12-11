import { Collection, ObjectId } from 'mongodb';
import {
  setReportAsCompleted,
  createReportAndSetAsCompleted,
  setToNotReceivedOrDeleteReport,
  updateManyUtilisationReportStatuses,
} from './utilisation-report-status-repo';
import {
  ReportFilterWithBankId,
  ReportFilter,
  UpdateUtilisationReportStatusInstructions,
  UtilisationReportReconciliationStatus,
} from '../../types/utilisation-reports';
import { UploadedByUserDetails, UtilisationReport } from '../../types/db-models/utilisation-reports';
import db from '../../drivers/db-client';
import { MOCK_AZURE_FILE_INFO } from '../../../api-tests/mocks/azure-file-info';
import banksRepo from './banks-repo';

console.error = jest.fn();

describe('utilisation-report-status-repo', () => {
  const updateOneSpy = jest.fn().mockResolvedValue(null);
  const deleteOneSpy = jest.fn().mockResolvedValue(null);
  const findOneSpy = jest.fn().mockResolvedValue(null);
  const utilisationReportsCollection = {
    updateOne: updateOneSpy,
    deleteOne: deleteOneSpy,
    findOne: findOneSpy,
  } as unknown as Collection;
  const mockUploadedByUser: UploadedByUserDetails = {
    firstname: 'test',
    surname: 'user',
  };

  afterEach(() => {
    updateOneSpy.mockReset();
    deleteOneSpy.mockReset();
    findOneSpy.mockReset();
  });

  describe('setReportAsCompleted', () => {
    it("should call 'updateOne' with the report id as an ObjectId and status as 'RECONCILIATION_COMPLETED'", () => {
      // Arrange
      const reportId = '5ce819935e539c343f141ece';
      const filter = { _id: new ObjectId(reportId) };
      const status: UtilisationReportReconciliationStatus = 'RECONCILIATION_COMPLETED';

      // Act
      setReportAsCompleted(utilisationReportsCollection, filter);

      // Assert
      expect(updateOneSpy).toHaveBeenLastCalledWith(filter, {
        $set: {
          status,
        },
      });
    });
  });

  describe('createReportAndSetAsCompleted', () => {
    const getBankNameByIdSpy = jest.spyOn(banksRepo, 'getBankNameById');
    const bankId = '123';
    const month = 1;
    const year = 2023;
    const filter: ReportFilterWithBankId = { month, year, 'bank.id': bankId };

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should throw an error when the bank name is undefined (a bank with the specified id does not exist)', async () => {
      // Arrange
      getBankNameByIdSpy.mockResolvedValue(undefined);

      // Act
      try {
        await createReportAndSetAsCompleted(utilisationReportsCollection, filter, mockUploadedByUser);
      } catch (error) {
        // Assert
        expect(error).toEqual(Error(`Bank with id ${bankId} does not exist`));
      }
    });

    it("should set the report status to 'RECONCILIATION_COMPLETED' with a placeholder report to set on insert", async () => {
      // Arrange
      const bankName = 'test bank';
      getBankNameByIdSpy.mockResolvedValue(bankName);
      const placeholderUtilisationReport: Partial<UtilisationReport> = {
        month,
        year,
        bank: {
          id: bankId,
          name: bankName,
        },
        azureFileInfo: null,
        uploadedBy: mockUploadedByUser,
        dateUploaded: new Date(),
      };

      // Act
      await createReportAndSetAsCompleted(utilisationReportsCollection, filter, mockUploadedByUser);

      // Assert
      expect(updateOneSpy).toHaveBeenLastCalledWith(filter, {
        $set: {
          status: 'RECONCILIATION_COMPLETED',
        },
        $setOnInsert: placeholderUtilisationReport,
      }, { upsert: true });
    });
  });

  describe('setToNotReceivedOrDeleteReport', () => {
    const filter: ReportFilter = {
      month: 1,
      year: 2023,
      'bank.id': '123',
    };

    describe('when the report does not already exist', () => {
      it('should throw an error', async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce(null);

        // Act
        try {
          await setToNotReceivedOrDeleteReport(utilisationReportsCollection, filter);
        } catch (error) {
          // Assert
          expect(error).toEqual(new Error("Cannot set report to 'NOT_RECEIVED': report does not exist"));
        }
      });
    });

    describe('when the report does already exist', () => {
      const placeholderUtilisationReport: Omit<UtilisationReport, '_id'> = {
        month: 1,
        year: 2023,
        bank: {
          id: '123',
          name: 'test bank',
        },
        azureFileInfo: null,
        status: 'RECONCILIATION_COMPLETED',
        uploadedBy: mockUploadedByUser,
        dateUploaded: new Date(),
      };

      it('should delete the report if azureFileInfo is null', async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce(placeholderUtilisationReport);

        // Act
        await setToNotReceivedOrDeleteReport(utilisationReportsCollection, filter);

        // Assert
        expect(deleteOneSpy).toHaveBeenLastCalledWith(filter);
      });

      it("should set the status to 'REPORT_NOT_RECEIVED' if azureFileInfo is defined", async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce({
          ...placeholderUtilisationReport,
          azureFileInfo: MOCK_AZURE_FILE_INFO,
        });

        // Act
        await setToNotReceivedOrDeleteReport(utilisationReportsCollection, filter);

        // Assert
        expect(updateOneSpy).toHaveBeenLastCalledWith(filter, {
          $set: {
            status: 'REPORT_NOT_RECEIVED',
          },
        });
      });
    });
  });

  describe('updateManyUtilisationReportStatuses', () => {
    const getUtilisationReportsCollectionMock = jest.fn().mockResolvedValue(utilisationReportsCollection);

    beforeEach(() => {
      jest.spyOn(db, 'getCollection').mockImplementation(getUtilisationReportsCollectionMock);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should throw an error when the list of update instructions contains an invalid status', async () => {
      // Arrange
      const updateInstructions: UpdateUtilisationReportStatusInstructions[] = [
        {
          filter: { month: 1, year: 2023, 'bank.id': '123' },
          status: 'INVALID_STATUS' as UtilisationReportReconciliationStatus,
        },
      ];

      // Act
      try {
        await updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser);
      } catch (error) {
        // Assert
        expect(error).toEqual(new Error('Request body supplied does not match required format'));
      }
    });

    it("should call 'updateOne' 3 times when 3 specific update instructions are provided", async () => {
      // Arrange
      const reportId = '5ce819935e539c343f141ece';
      const filter = { _id: new ObjectId(reportId) };
      const status: UtilisationReportReconciliationStatus = 'RECONCILIATION_COMPLETED';
      const updateInstructions: UpdateUtilisationReportStatusInstructions[] = [
        { filter, status },
        { filter, status },
        { filter, status },
      ];

      // Act
      await updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser);

      // Assert
      expect(updateOneSpy).toHaveBeenCalledTimes(3);
    });
  });
});
