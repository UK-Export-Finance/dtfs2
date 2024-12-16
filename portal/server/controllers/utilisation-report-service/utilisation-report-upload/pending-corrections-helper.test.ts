import { aPortalSessionUser, getFormattedReportPeriodWithLongMonth, ReportPeriod } from '@ukef/dtfs2-common';
import {
  mapNextDueReportPeriodToNextActionViewModel,
  mapToPendingCorrectionsViewModel,
  isNonEmptyPendingCorrectionsResponseBody,
} from './pending-corrections-helper';
import { NonEmptyPendingCorrectionsResponseBody, UtilisationReportPendingCorrectionsResponseBody } from '../../../api-response-types';
import { PRIMARY_NAV_KEY } from '../../../constants';
import { aNonEmptyPendingCorrectionsResponseBody } from '../../../../test-helpers/test-data';

describe('pending-corrections-helper', () => {
  const mockToday = new Date('2023-04-01');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockToday);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('mapNextDueReportPeriodToNextActionViewModel', () => {
    it.each`
      condition                                      | nextDueReportPeriod
      ${'Monthly report period from current year'}   | ${{ start: { month: 3, year: 2023 }, end: { month: 3, year: 2023 } }}
      ${'Monthly report period from previous year'}  | ${{ start: { month: 3, year: 2022 }, end: { month: 3, year: 2022 } }}
      ${'Quarterly report period in year before'}    | ${{ start: { month: 10, year: 2022 }, end: { month: 12, year: 2022 } }}
      ${'Quarterly report period in current year'}   | ${{ start: { month: 1, year: 2023 }, end: { month: 3, year: 2023 } }}
      ${'Quarterly report period spanning year end'} | ${{ start: { month: 12, year: 2022 }, end: { month: 2, year: 2023 } }}
    `(
      'should return reportCurrentlyDueForUpload when submission period start date is before today ($condition)',
      ({ nextDueReportPeriod }: { nextDueReportPeriod: ReportPeriod }) => {
        // Act
        const result = mapNextDueReportPeriodToNextActionViewModel(nextDueReportPeriod);

        // Assert
        expect(result).toEqual({
          reportCurrentlyDueForUpload: {
            formattedReportPeriod: getFormattedReportPeriodWithLongMonth(nextDueReportPeriod),
          },
        });
      },
    );

    it.each`
      condition                                        | nextDueReportPeriod                                                    | expectedUploadFromDate
      ${'Monthly report period for current month'}     | ${{ start: { month: 4, year: 2023 }, end: { month: 4, year: 2023 } }}  | ${'1 May 2023'}
      ${'Monthly report period for next month'}        | ${{ start: { month: 5, year: 2023 }, end: { month: 5, year: 2023 } }}  | ${'1 June 2023'}
      ${'Quarterly report period for current quarter'} | ${{ start: { month: 2, year: 2023 }, end: { month: 4, year: 2023 } }}  | ${'1 May 2023'}
      ${'Quarterly report period for next quarter'}    | ${{ start: { month: 5, year: 2023 }, end: { month: 7, year: 2023 } }}  | ${'1 August 2023'}
      ${'Quarterly report period spanning year end'}   | ${{ start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } }} | ${'1 March 2024'}
    `(
      'should return reportSoonToBeDueForUpload when submission period starts in the future ($condition)',
      ({ nextDueReportPeriod, expectedUploadFromDate }: { nextDueReportPeriod: ReportPeriod; expectedUploadFromDate: string }) => {
        // Act
        const result = mapNextDueReportPeriodToNextActionViewModel(nextDueReportPeriod);

        // Assert
        expect(result).toEqual({
          reportSoonToBeDueForUpload: {
            formattedReportPeriod: getFormattedReportPeriodWithLongMonth(nextDueReportPeriod),
            formattedUploadFromDate: expectedUploadFromDate,
          },
        });
      },
    );
  });

  describe('mapToPendingCorrectionsViewModel', () => {
    it('should map pending corrections response and user to PendingCorrectionsViewModel', () => {
      // Arrange
      const pendingCorrectionsResponse: NonEmptyPendingCorrectionsResponseBody = {
        ...aNonEmptyPendingCorrectionsResponseBody(),
        reportPeriod: { start: { month: 2, year: 2023 }, end: { month: 2, year: 2023 } },
        nextDueReportPeriod: { start: { month: 3, year: 2023 }, end: { month: 3, year: 2023 } },
        uploadedByFullName: 'John Doe',
        dateUploaded: '2023-01-01T00:00:00.000Z',
      };
      const user = aPortalSessionUser();

      // Act
      const result = mapToPendingCorrectionsViewModel(pendingCorrectionsResponse, user);

      // Assert
      const expectedDateUploaded = '1 January 2023';
      expect(result).toEqual({
        user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        formattedReportPeriod: getFormattedReportPeriodWithLongMonth(pendingCorrectionsResponse.reportPeriod),
        uploadedByFullName: pendingCorrectionsResponse.uploadedByFullName,
        formattedDateUploaded: expectedDateUploaded,
        corrections: pendingCorrectionsResponse.corrections,
        nextAction: mapNextDueReportPeriodToNextActionViewModel(pendingCorrectionsResponse.nextDueReportPeriod),
      });
    });
  });

  describe('isNonEmptyPendingCorrectionsResponseBody', () => {
    it('should return true if the response body is not an empty object', () => {
      const responseBody = aNonEmptyPendingCorrectionsResponseBody();

      const result = isNonEmptyPendingCorrectionsResponseBody(responseBody);

      expect(result).toBe(true);
    });

    it('should return false if the response body is an empty object', () => {
      const responseBody: UtilisationReportPendingCorrectionsResponseBody = {};

      const result = isNonEmptyPendingCorrectionsResponseBody(responseBody);

      expect(result).toBe(false);
    });
  });
});
