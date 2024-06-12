import { MONGO_DB_COLLECTIONS, UtilisationData, UtilisationReport } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../../drivers/db-client';

export const getAllUtilisationDataForReport = async ({ _id: reportId, reportPeriod }: UtilisationReport): Promise<UtilisationData[]> => {
  const utilisationDataCollection = await db.getCollection(MONGO_DB_COLLECTIONS.UTILISATION_DATA);
  return await utilisationDataCollection
    .find({
      reportId: { $eq: reportId.toString() },
      'reportPeriod.start.month': { $eq: reportPeriod.start.month },
      'reportPeriod.start.year': { $eq: reportPeriod.start.year },
    })
    .toArray();
};
