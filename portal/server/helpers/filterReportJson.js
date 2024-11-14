import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';

export const filterReportJsonToRelevantKeys = (reportJson) => {
  const relevantKeys = Object.values(UTILISATION_REPORT_HEADERS);

  const filteredJson = reportJson.map((row) => {
    return Object.keys(row).reduce((acc, key) => {
      const reducedKeysObject = acc;
      if (relevantKeys.includes(key)) {
        reducedKeysObject[key] = row[key];
      }

      return reducedKeysObject;
    }, {});
  });
  return filteredJson;
};
