import { ObjectId } from 'mongodb';
import {
  PlaceholderUtilisationReport, ReportDetails, ReportFilter, ReportStatus,
} from '../../types/utilisation-report-status';
import { CollectionMock } from '../../types/mocks';
import {
  setReportStatusByReportId,
  createOrSetReportAsReceived,
  setToNotReceivedOrDeleteReport,
  setReportStatusByReportDetails,
} from './utilisation-report-status-repo';

console.error = jest.fn();

describe('utilisation-report-status-repo', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error');
  const updateOneSpy = jest.fn().mockResolvedValue(null);
  const deleteOneSpy = jest.fn().mockResolvedValue(null);
  const findOneSpy = jest.fn().mockResolvedValue(null);
  const getCollectionMock = () => ({
    updateOne: updateOneSpy,
    deleteOne: deleteOneSpy,
    findOne: findOneSpy,
  } as CollectionMock);
  const collection: CollectionMock = getCollectionMock();

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('setReportStatusByReportId', () => {
    const reportId = '5ce819935e539c343f141ece';

    it.each([
      { status: 'REPORT_NOT_RECEIVED' as ReportStatus, report: { id: reportId } },
      { status: 'PENDING_RECONCILIATION' as ReportStatus, report: { id: reportId } },
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
      const invalidStatus = 'INVALID_STATUS';
      const id = reportId;

      // Act
      // @ts-ignore
      setReportStatusByReportId(id, invalidStatus, collection);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`The status '${invalidStatus}' is not supported by '/v1/utilisation-reports/set-status'`);
    });
  });

  describe('createOrSetReportAsReceived', () => {
    it("should set the report status to 'REPORT_NOT_RECEIVED' with a placeholder report to set on insert", () => {
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
      const placeholderUtilisationReport: PlaceholderUtilisationReport = {
        month: reportDetails.month,
        year: reportDetails.year,
        bank: {
          id: reportDetails.bankId,
        },
        azureFileInfo: undefined,
      };

      // Act
      createOrSetReportAsReceived(reportDetails, filter, collection);

      // Assert
      expect(updateOneSpy).toHaveBeenCalledWith(filter, {
        $set: {
          status: 'PENDING_RECONCILIATION',
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
      const placeholderReport: PlaceholderUtilisationReport = {
        month: 1,
        year: 2023,
        bank: {
          id: '123',
        },
        azureFileInfo: undefined,
      };

      it('should delete the report if azureFileInfo is undefined', async () => {
        // Arrange
        findOneSpy.mockResolvedValueOnce(placeholderReport);

        // Act
        await setToNotReceivedOrDeleteReport(filter, collection);

        // Assert
        expect(deleteOneSpy).toHaveBeenCalledWith(filter);
      });

      it("should set the status to 'PENDING_RECONCILIATION' if azureFileInfo is defined", async () => {
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
    const placeholderReport: PlaceholderUtilisationReport = {
      month: 1,
      year: 2023,
      bank: {
        id: '123',
      },
      azureFileInfo: undefined,
    };

    it("should call updateOne to set the status as 'REPORT_NOT_RECEIVED'", () => {
      // Arrange
      findOneSpy.mockResolvedValueOnce({
        ...placeholderReport,
        azureFileInfo: {
          fullPath: 'www.abc.com',
        },
      });
      const status = 'REPORT_NOT_RECEIVED' as ReportStatus;
      const expectedFilter: ReportFilter = {
        month: reportDetails.month,
        year: reportDetails.year,
        'bank.id': reportDetails.bankId,
      };

      // Act
      setReportStatusByReportDetails(reportDetails, status, collection);

      // Assert
      expect(updateOneSpy).toHaveBeenCalledWith(expectedFilter, {
        $set: {
          status,
        },
      });
    });

    it("should call updateOne to set the status as 'PENDING_RECONCILIATION'", () => {
      // Arrange
      const status = 'PENDING_RECONCILIATION' as ReportStatus;
      const expectedFilter: ReportFilter = {
        month: reportDetails.month,
        year: reportDetails.year,
        'bank.id': reportDetails.bankId,
      };

      // Act
      setReportStatusByReportDetails(reportDetails, status, collection);

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
      const invalidStatus = 'INVALID_STATUS';

      // Act
      // @ts-ignore
      setReportStatusByReportDetails(reportDetails, invalidStatus, collection);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(`The status '${invalidStatus}' is not supported by '/v1/utilisation-reports/set-status'`);
    });
  });
});
