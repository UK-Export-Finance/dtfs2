import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';

/**
 * Iterates through an array of objects and removes any key value pairs
 * from each object where the key isn't in the UTILISATION_REPORT_HEADERS const
 * @param {import('@ukef/dtfs2-common').UtilisationReportCsvRowData[]} reportJson - Array of objects representing the report in JSON format
 * @returns {import('@ukef/dtfs2-common').UtilisationReportCsvRowData[]} Filtered down object
 */
export const filterReportJsonToRelevantKeys = (reportJson) => {
  const relevantKeys = Object.values(UTILISATION_REPORT_HEADERS);

  const filteredJson = reportJson.map((reportRow) => {
    return Object.keys(reportRow).reduce((acc, key) => {
      const reducedKeysObject = acc;
      if (relevantKeys.includes(key)) {
        reducedKeysObject[key] = reportRow[key];
      }

      return reducedKeysObject;
    }, {});
  });
  return filteredJson;
};
