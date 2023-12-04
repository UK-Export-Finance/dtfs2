import { Collection, ObjectId } from 'mongodb';
import {
  UtilisationReport, ReportDetails, ReportFilter, ReportStatus,
} from '../../types/utilisation-report-status';
import {
  setReportStatusByReportId,
  createOrSetReportAsReceived,
  setToNotReceivedOrDeleteReport,
  setReportStatusByReportDetails,
} from './utilisation-report-status-repo';
import { TFMUser } from '../../types/users';

console.error = jest.fn();

describe('utilisation-report-status-repo', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error');
  const updateOneSpy = jest.fn().mockResolvedValue(null);
  const deleteOneSpy = jest.fn().mockResolvedValue(null);
  const findOneSpy = jest.fn().mockResolvedValue(null);
  const collection = {
    updateOne: updateOneSpy,
    deleteOne: deleteOneSpy,
    findOne: findOneSpy,
  } as unknown as Collection;
  const mockTfmUser: TFMUser = {
    username: 'test_user',
    email: 'test@test-user.com',
    teams: [],
    firstName: 'test',
    lastName: 'user',
  };

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('setReportStatusByReportId', () => {
    const reportId = '5ce819935e539c343f141ece';

    it.each([
      { status: 'REPORT_NOT_RECEIVED' as ReportStatus, report: { id: reportId } },
      { status: 'RECONCILIATION_COMPLETED' as ReportStatus, report: { id: reportId } },
    ])("should call updateOne with the report id as an ObjectId and status as '$status'", ({ status, report }) => {
      // Arrange
      const { id } = report;
      const expectedFilter: ReportFilter = { _id: new ObjectId(id) };

      // Act
      setReportStatusByReportId(id, status, collection);

      // Assert
      expect(updateOneSpy).toHaveBeenCalledWith(expectedFilter, {
        $set: {
          status,
        },
      });
    });

    it('should log the failure to set status without throwing an error if an invalid status is used', () => {
      // Arrange
      const invalidStatus = 'INVALID_STATUS' as ReportStatus;
      const id = reportId;

      // Act
      setReportStatusByReportId(id, invalidStatus, collection);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`The status '${invalidStatus}' is not supported by '/v1/utilisation-reports/set-status'`);
    });
  });

  describe('createOrSetReportAsReceived', () => {
    it("should set the report status to 'RECONCILIATION_COMPLETED' with a placeholder report to set on insert", () => {
      // Arrange
      const reportDetails: ReportDetails = {
        month: 1,
        year: 2023,
        bankId: '123',
      };
      const filter: ReportFilter = {
        month: reportDetails.month,
        year: reportDetails.year,
        'bank.id': reportDetails.bankId,
      };
      const placeholderUtilisationReport: UtilisationReport = {
        month: reportDetails.month,
        year: reportDetails.year,
        bank: {
          id: reportDetails.bankId,
        },
        azureFileInfo: null,
        uploadedBy: mockTfmUser,
        dateUploaded: new Date(),
      } as UtilisationReport;

      // Act
      createOrSetReportAsReceived(reportDetails, mockTfmUser, filter, collection);

      // Assert
      expect(updateOneSpy).toHaveBeenCalledWith(filter, {
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
      it('should console log an error without throwing', async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce(null);

        // Act
        await setToNotReceivedOrDeleteReport(filter, collection);

        // Assert
        expect(consoleErrorSpy).toHaveBeenCalledWith('Report matching supplied filter does not exist');
      });
    });

    describe('when the report does already exist', () => {
      const placeholderReport: UtilisationReport = {
        month: 1,
        year: 2023,
        bank: {
          id: '123',
        },
        azureFileInfo: null,
        uploadedBy: mockTfmUser,
        dateUploaded: new Date(),
      } as UtilisationReport;

      it('should delete the report if azureFileInfo is null', async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce(placeholderReport);

        // Act
        await setToNotReceivedOrDeleteReport(filter, collection);

        // Assert
        expect(deleteOneSpy).toHaveBeenCalledWith(filter);
      });

      it("should set the status to 'REPORT_NOT_RECEIVED' if azureFileInfo is defined", async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce({
          ...placeholderReport,
          azureFileInfo: {
            fullPath: 'www.abc.com',
          },
        });

        // Act
        await setToNotReceivedOrDeleteReport(filter, collection);

        // Assert
        expect(updateOneSpy).toHaveBeenCalledWith(filter, {
          $set: {
            status: 'REPORT_NOT_RECEIVED',
          },
        });
      });
    });
  });

  describe('setReportStatusByReportDetails', () => {
    const reportDetails: ReportDetails = {
      month: 1,
      year: 2023,
      bankId: '123',
    };
    const placeholderReport: UtilisationReport = {
      month: 1,
      year: 2023,
      bank: {
        id: '123',
      },
      azureFileInfo: null,
      uploadedBy: mockTfmUser,
      dateUploaded: new Date(),
    } as UtilisationReport;

    it("should call updateOne to set the status as 'REPORT_NOT_RECEIVED' when the status is 'REPORT_NOT_RECEIVED'", () => {
      // Arrange
      findOneSpy.mockResolvedValueOnce({
        ...placeholderReport,
        azureFileInfo: {
          fullPath: 'www.abc.com',
        },
      });
      const status: ReportStatus = 'REPORT_NOT_RECEIVED';
      const expectedFilter: ReportFilter = {
        month: reportDetails.month,
        year: reportDetails.year,
        'bank.id': reportDetails.bankId,
      };

      // Act
      setReportStatusByReportDetails(reportDetails, mockTfmUser, status, collection);

      // Assert
      expect(updateOneSpy).toHaveBeenCalledWith(expectedFilter, {
        $set: {
          status,
        },
      });
    });

    it("should call updateOne to set the status as 'RECONCILIATION_COMPLETED' when the status is 'RECONCILIATION_COMPLETED'", () => {
      // Arrange
      const status: ReportStatus = 'RECONCILIATION_COMPLETED';
      const expectedFilter: ReportFilter = {
        month: reportDetails.month,
        year: reportDetails.year,
        'bank.id': reportDetails.bankId,
      };

      // Act
      setReportStatusByReportDetails(reportDetails, mockTfmUser, status, collection);

      // Assert
      expect(updateOneSpy).toHaveBeenCalledWith(expectedFilter, {
        $set: {
          status,
        },
        $setOnInsert: placeholderReport,
      }, { upsert: true });
    });

    it('should log the failure to set status without throwing an error if an invalid status is used', () => {
      // Arrange
      const invalidStatus = 'INVALID_STATUS' as ReportStatus;

      // Act
      setReportStatusByReportDetails(reportDetails, mockTfmUser, invalidStatus, collection);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`The status '${invalidStatus}' is not supported by '/v1/utilisation-reports/set-status'`);
    });
  });
});
