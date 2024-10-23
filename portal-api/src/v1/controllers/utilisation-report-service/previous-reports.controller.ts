import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import orderBy from 'lodash/orderBy';
import api from '../../api';
import { UtilisationReportResponseBody } from '../../api-response-types';

/**
 * Returns a set of unique years based on reports from the database.
 * @param reports - reports from the database
 * @returns unique set of years
 */
export const getYears = (reports: UtilisationReportResponseBody[]): number[] => {
  const years = reports.flatMap((report) => [report.reportPeriod.start.year, report.reportPeriod.end.year]);
  return [...new Set(years)];
};

type GroupedReport = {
  year: number;
  reports: UtilisationReportResponseBody[];
};

/**
 * Groups database reports by year
 * Reports covering a period spanning two years will be included in both years spanned
 * @param years - unique set of years
 * @param reports - reports from the database
 * @returns - list of objects with year and reports property
 */
export const groupReportsByYear = (years: number[], reports: UtilisationReportResponseBody[]): GroupedReport[] =>
  years.map((year) => ({
    year,
    reports: reports.filter((report) => report.reportPeriod.end.year === year || report.reportPeriod.start.year === year),
  }));

/**
 * Adds an object for all year with is no database reports when there is a report for the
 * previous and future years
 * @param reportsGroupedByStartYear - list of objects with year and reports property
 * @param years - unique set of years
 * @returns list of objects with year and reports property
 */
export const populateOmittedYears = (reportsGroupedByStartYear: GroupedReport[], years: number[]): GroupedReport[] => {
  years.forEach((year, index) => {
    if (index > 0 && year - years[index - 1] > 1) {
      let numberOfMissingYears = year - years[index - 1] - 1;
      while (numberOfMissingYears > 0) {
        reportsGroupedByStartYear.push({
          year: year - numberOfMissingYears,
          reports: [],
        });
        numberOfMissingYears -= 1;
      }
    }
  });
  return reportsGroupedByStartYear;
};

/**
 * Groups the reports by year and sorts year descending
 * @param dbReports - reports from the database
 * @returns list of objects with year and reports property
 */
export const groupAndSortReports = (dbReports: UtilisationReportResponseBody[]): GroupedReport[] => {
  const years = getYears(dbReports);
  const groupedReports = groupReportsByYear(years, dbReports);
  const groupedReportsWithPopulatedOmmittedYears = populateOmittedYears(groupedReports, years);
  return orderBy(groupedReportsWithPopulatedOmmittedYears, ['year'], ['desc']);
};

type GetPreviousReportsByBankIdRequest = Request<{ bankId: string }>;

export const getPreviousReportsByBankId = async (req: GetPreviousReportsByBankIdRequest, res: Response) => {
  try {
    const { bankId } = req.params;

    const uploadedReports = await api.getUtilisationReports(bankId, {
      excludeNotReceived: true,
    });

    const sortedReports = groupAndSortReports(uploadedReports);

    return res.status(200).send(sortedReports);
  } catch (error) {
    console.error('Unable to get previous reports %o', error);
    if (error instanceof AxiosError) {
      return res.status(error.response?.status ?? 500).send({ message: 'Failed to get previous reports' });
    }
    return res.status(500).send({ message: 'Failed to get previous reports' });
  }
};
