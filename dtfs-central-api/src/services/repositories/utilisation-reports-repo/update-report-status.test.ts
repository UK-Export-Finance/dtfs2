import { ObjectId, WithoutId } from 'mongodb';
import { updateManyUtilisationReportStatuses } from './update-report-status';
import { ReportFilterWithBankId, UpdateUtilisationReportStatusInstructions, UtilisationReportReconciliationStatus } from '../../../types/utilisation-reports';
import { UploadedByUserDetails, UtilisationReport } from '../../../types/db-models/utilisation-reports';
import db from '../../../drivers/db-client';
import { MOCK_AZURE_FILE_INFO } from '../../../../api-tests/mocks/azure-file-info';
import * as banksRepo from '../banks-repo';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';

console.error = jest.fn();

describe('utilisation-report-repo: update-report-status', () => {
  const updateOneSpy = jest.fn().mockResolvedValue(null);
  const deleteOneSpy = jest.fn().mockResolvedValue(null);
  const findOneSpy = jest.fn().mockResolvedValue(null);
  const utilisationReportsCollection = {
    updateOne: updateOneSpy,
    deleteOne: deleteOneSpy,
    findOne: findOneSpy,
  };
  const mockUploadedByUser: UploadedByUserDetails = {
    id: '123',
    firstname: 'test',
    surname: 'user',
  };

  const getUtilisationReportsCollectionMock = jest.fn().mockResolvedValue(utilisationReportsCollection);
  const getBankNameByIdMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(db, 'getCollection').mockImplementation(getUtilisationReportsCollectionMock);
    jest.spyOn(banksRepo, 'getBankNameById').mockImplementation(getBankNameByIdMock);
  });

  afterEach(() => {
    updateOneSpy.mockReset();
    deleteOneSpy.mockReset();
    findOneSpy.mockReset();
    jest.restoreAllMocks();
  });

  describe('updateManyUtilisationReportStatuses', () => {
    it('should throw an error when the list of update instructions contains an invalid status', async () => {
      // Arrange
      const updateInstructions: UpdateUtilisationReportStatusInstructions[] = [
        {
          filter: { month: 1, year: 2023, 'bank.id': '123' },
          status: 'INVALID_STATUS' as UtilisationReportReconciliationStatus,
        },
      ];

      // Act / Assert
      await expect(updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser)).rejects.toThrow(
        new Error('Request body supplied does not match required format'),
      );
    });

    it("should call 'updateOne' 3 times when 3 valid update instructions are provided", async () => {
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

    describe(`when trying to set the status of a report that doesn't already exist to '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}'`, () => {
      const status = UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED;
      const bankId = '123';
      const month = 1;
      const year = 2023;
      const filter: ReportFilterWithBankId = { month, year, 'bank.id': bankId };
      const updateInstructions: UpdateUtilisationReportStatusInstructions[] = [{ filter, status }];

      it('should throw an error when the bank name is undefined (a bank with the specified id does not exist)', async () => {
        // Arrange
        getBankNameByIdMock.mockResolvedValue(undefined);

        // Act / Assert
        await expect(updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser)).rejects.toThrow(
          new Error(`Bank with id ${bankId} does not exist`),
        );
      });

      it(`should set the report status to '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}' with a placeholder report to set on insert`, async () => {
        // Arrange
        const bankName = 'test bank';
        getBankNameByIdMock.mockResolvedValue(bankName);
        const placeholderUtilisationReport: Omit<UtilisationReport, '_id' | 'status'> = {
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
        await updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser);

        // Assert
        expect(updateOneSpy).toHaveBeenLastCalledWith(
          filter,
          {
            $set: {
              status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
            },
            $setOnInsert: placeholderUtilisationReport,
          },
          { upsert: true },
        );
      });
    });

    describe(`when trying to set the status of a placeholder report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}'`, () => {
      const status = UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;
      const bankId = '123';
      const month = 1;
      const year = 2023;
      const filter: ReportFilterWithBankId = { month, year, 'bank.id': bankId };
      const updateInstructions: UpdateUtilisationReportStatusInstructions[] = [{ filter, status }];

      beforeEach(() => {
        getBankNameByIdMock.mockResolvedValue('test bank');
      });

      it('should throw an error when the report does not already exist', async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce(null);

        // Act / Assert
        await expect(updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser)).rejects.toThrow(
          new Error(`Cannot set report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}': report does not exist`),
        );
      });

      const placeholderUtilisationReport: WithoutId<UtilisationReport> = {
        month,
        year,
        bank: {
          id: bankId,
          name: 'test bank',
        },
        azureFileInfo: null,
        uploadedBy: mockUploadedByUser,
        dateUploaded: new Date(),
        status,
      };

      it('should delete the report if the report exists and azureFileInfo is null', async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce(placeholderUtilisationReport);

        // Act
        await updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser);

        // Assert
        expect(deleteOneSpy).toHaveBeenLastCalledWith(filter);
      });

      it(`should set the status to '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}' if azureFileInfo is defined`, async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce({
          ...placeholderUtilisationReport,
          azureFileInfo: MOCK_AZURE_FILE_INFO,
        });

        // Act
        await updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser);

        // Assert
        expect(updateOneSpy).toHaveBeenLastCalledWith(filter, {
          $set: {
            status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
          },
        });
      });
    });

    describe(`when setting the status of an existing report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}'`, () => {
      it(`should call 'updateOne' with the report id as an ObjectId and status as '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}'`, async () => {
        // Arrange
        const reportId = '5ce819935e539c343f141ece';
        const filter = { _id: new ObjectId(reportId) };
        const status = UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED;
        const updateInstructions: UpdateUtilisationReportStatusInstructions[] = [{ filter, status }];

        // Act
        await updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser);

        // Assert
        expect(updateOneSpy).toHaveBeenLastCalledWith(filter, {
          $set: {
            status,
          },
        });
      });
    });
  });
});
