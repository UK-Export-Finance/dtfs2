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
  const years = reports.map((report) => report.reportPeriod.start.year);
  return [...new Set(years)];
};

type GroupedReport = {
  year: number;
  reports: UtilisationReportResponseBody[];
};

/**
 * Groups database reports by year
 * @param years - unique set of years
 * @param reports - reports from the database
 * @returns - list of objects with year and reports property
 */
export const groupReportsByStartYear = (years: number[], reports: UtilisationReportResponseBody[]): GroupedReport[] =>
  years.map((year) => ({
    year,
    reports: reports.filter((report) => report.reportPeriod.start.year === year),
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
  const groupedReports = groupReportsByStartYear(years, dbReports);
  const groupedReportsByStartYear = populateOmittedYears(groupedReports, years);
  return orderBy(groupedReportsByStartYear, ['year'], ['desc']);
};

type GetPreviousReportsByBankIdRequest = Request<{ bankId: string }>;

export const getPreviousReportsByBankId = async (req: GetPreviousReportsByBankIdRequest, res: Response) => {
  try {
    const { bankId } = req.params;

    const uploadedReports = (
      await api.getUtilisationReports(bankId, {
        excludeNotReceived: true,
      })
    ).filter((report) => !!report.azureFileInfo);

    const sortedReports = groupAndSortReports(uploadedReports);

    return res.status(200).send(sortedReports);
  } catch (error) {
    console.error('Unable to get previous reports %O', error);
    if (error instanceof AxiosError) {
      return res.status(error.response?.status ?? 500).send({ message: 'Failed to get previous reports' });
    }
    return res.status(500).send({ message: 'Failed to get previous reports' });
  }
};
