import { WithId } from 'mongodb';
import { MongoDbCollectionName } from './mongo-db-collection-name';
import { Bank } from './banks';
import { PortalUser } from './users';
import { TfmUser } from './tfm-users';
import { TfmTeam } from './tfm-teams';
import { CronJobLog } from './cron-job-logs';
import { UtilisationReport } from './utilisation-reports';
import { UtilisationData } from './utilisation-data';

export type DbModel<TCollectionName extends MongoDbCollectionName> = TCollectionName extends 'banks'
  ? Bank
  : TCollectionName extends 'users'
  ? PortalUser
  : TCollectionName extends 'tfm-users'
  ? TfmUser
  : TCollectionName extends 'tfm-teams'
  ? TfmTeam
  : TCollectionName extends 'cron-job-logs'
  ? CronJobLog
  : TCollectionName extends 'utilisationReports' // TODO FN-1853 Remove after SQL refactor
  ? UtilisationReport
  : TCollectionName extends 'utilisationData'
  ? UtilisationData
  : WithId<object>;
