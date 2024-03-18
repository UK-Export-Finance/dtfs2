import { Filter } from 'mongodb';
import { MONGO_DB_COLLECTIONS, UTILISATION_REPORT_RECONCILIATION_STATUS, ReportPeriod, UtilisationReport } from '@ukef/dtfs2-common';
import {
  getOneUtilisationReportDetailsByBankId,
  saveNotReceivedUtilisationReport,
} from './utilisation-reports-repo';
import db from '../../drivers/db-client';
import { GetUtilisationReportDetailsOptions } from '.';

describe('utilisation-reports-repo', () => {
  describe('saveNewUtilisationReportAsSystemUser', () => {
    it('maps the data and correctly saves to the database', async () => {
      // Arrange
      const insertOneSpy = jest.fn();
      const getCollectionMock = jest.fn().mockResolvedValue({
        insertOne: insertOneSpy,
      });
      jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);

      const mockReportPeriod: ReportPeriod = {
        start: {
          month: 1,
          year: 2021,
        },
        end: {
          month: 1,
          year: 2021,
        },
      };
      const mockSessionBank = {
        id: '123',
        name: 'Test bank',
      };

      // Act
      await saveNotReceivedUtilisationReport(mockReportPeriod, mockSessionBank);

      // Assert
      expect(getCollectionMock).toHaveBeenCalledWith(MONGO_DB_COLLECTIONS.UTILISATION_REPORTS);
      expect(insertOneSpy).toHaveBeenCalledWith({
        bank: mockSessionBank,
        reportPeriod: {
          start: {
            month: 1,
            year: 2021,
          },
          end: {
            month: 1,
            year: 2021,
          },
        },
        azureFileInfo: null,
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      });
    });
  });

  describe('getOneUtilisationReportDetailsByBankId', () => {
    describe('when options are passed in', () => {
      const bankId = '123';
      const bankIdFilter = {
        'bank.id': { $eq: bankId },
      };

      const validReportPeriod: ReportPeriod = {
        start: {
          month: 1,
          year: 2024,
        },
        end: {
          month: 2,
          year: 2025,
        },
      };

      const findOneSpy = jest.fn();
      const getCollectionMock = jest.fn().mockResolvedValue({
        findOne: findOneSpy,
      });

      beforeEach(() => {
        jest.spyOn(db, 'getCollection').mockImplementation(getCollectionMock);
      });

      const optsWithExpectedFilters: {
        condition: string;
        opts: GetUtilisationReportDetailsOptions | undefined;
        expectedFilter: Filter<UtilisationReport>;
      }[] = [
        {
          condition: 'opts is undefined',
          opts: undefined,
          expectedFilter: { ...bankIdFilter },
        },
        {
          condition: 'a report period is passed in',
          opts: { reportPeriod: validReportPeriod },
          expectedFilter: { ...bankIdFilter, reportPeriod: { $eq: validReportPeriod } },
        },
        {
          condition: "an 'excludeNotReceived' query is passed in",
          opts: { excludeNotReceived: true },
          expectedFilter: { ...bankIdFilter, status: { $not: { $in: ['REPORT_NOT_RECEIVED'] } }, azureFileInfo: { $not: { $eq: null } } },
        },
        {
          condition: 'all options are defined',
          opts: { reportPeriod: validReportPeriod, excludeNotReceived: true },
          expectedFilter: {
            ...bankIdFilter,
            reportPeriod: { $eq: validReportPeriod },
            status: { $not: { $in: ['REPORT_NOT_RECEIVED'] } },
            azureFileInfo: { $not: { $eq: null } },
          },
        },
      ];

      it.each(optsWithExpectedFilters)("calls the 'findOne' function with the correct filter when $condition", async ({ opts, expectedFilter }) => {
        // Act
        await getOneUtilisationReportDetailsByBankId(bankId, opts);

        // Assert
        expect(findOneSpy).toHaveBeenCalledWith(expectedFilter);
      });
    });
  });
});
