import { ObjectId, WithoutId } from 'mongodb';
import { updateManyUtilisationReportStatuses } from './update-report-status';
import { UpdateUtilisationReportStatusInstructions, UtilisationReportReconciliationStatus } from '../../../types/utilisation-reports';
import { UploadedByUserDetails, UtilisationReport } from '../../../types/db-models/utilisation-reports';
import db from '../../../drivers/db-client';
import { MOCK_AZURE_FILE_INFO } from '../../../../api-tests/mocks/azure-file-info';
import * as banksRepo from '../banks-repo';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';

console.error = jest.fn();

type ReportFilter = UpdateUtilisationReportStatusInstructions['filter'];

describe('utilisation-report-repo: update-report-status', () => {
  const updateOneSpy = jest.fn().mockResolvedValue(null);
  const findOneSpy = jest.fn().mockResolvedValue(null);
  const utilisationReportsCollection = {
    updateOne: updateOneSpy,
    findOne: findOneSpy,
  };
  const mockUploadedByUser: UploadedByUserDetails = {
    id: '123',
    firstname: 'test',
    surname: 'user',
  };

  const validMongoObjectId = new ObjectId();

  const getUtilisationReportsCollectionMock = jest.fn().mockResolvedValue(utilisationReportsCollection);
  const getBankNameByIdMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(db, 'getCollection').mockImplementation(getUtilisationReportsCollectionMock);
    jest.spyOn(banksRepo, 'getBankNameById').mockImplementation(getBankNameByIdMock);
  });

  afterEach(() => {
    updateOneSpy.mockReset();
    findOneSpy.mockReset();
    jest.restoreAllMocks();
  });

  describe('updateManyUtilisationReportStatuses', () => {
    it('should throw an error when the list of update instructions contains an invalid status', async () => {
      // Arrange
      const updateInstructions: UpdateUtilisationReportStatusInstructions[] = [
        {
          filter: { _id: validMongoObjectId },
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
      const filter: ReportFilter = { _id: validMongoObjectId };
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

    describe(`when trying to set the status of a non-uploaded report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}'`, () => {
      const status = UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;
      const filter: ReportFilter = { _id: validMongoObjectId };
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
        reportPeriod: {
          start: {
            month: 1,
            year: 2024,
          },
          end: {
            month: 1,
            year: 2024,
          },
        },
        bank: {
          id: '123',
          name: 'test bank',
        },
        azureFileInfo: null,
        uploadedBy: mockUploadedByUser,
        dateUploaded: new Date(),
        status,
      };

      it(`should set the report to ${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED} if the report exists and azureFileInfo is null`, async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce(placeholderUtilisationReport);

        // Act
        await updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser);

        // Assert
        expect(updateOneSpy).toHaveBeenCalledWith(filter, {
          $set: {
            status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
          },
        });
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
      it(`should call 'updateOne' with the report id, uploadedByUser and status as '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}'`, async () => {
        // Arrange
        const reportId = '5ce819935e539c343f141ece';
        const filter: ReportFilter = { _id: new ObjectId(reportId) };
        const status = UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED;
        const updateInstructions: UpdateUtilisationReportStatusInstructions[] = [{ filter, status }];

        // Act
        await updateManyUtilisationReportStatuses(updateInstructions, mockUploadedByUser);

        // Assert
        expect(updateOneSpy).toHaveBeenLastCalledWith(filter, {
          $set: {
            status,
            uploadedBy: mockUploadedByUser,
          },
        });
      });
    });
  });
});
