import { WithId } from 'mongodb';
import { DbCollectionName } from './db-collection-name';
import { Bank } from './banks';
import { UtilisationData } from './utilisation-data';
import { UtilisationReport } from './utilisation-reports';

export type DbModel<TCollectionName extends DbCollectionName> = TCollectionName extends 'banks'
  ? Bank
  : TCollectionName extends 'utilisationData'
  ? UtilisationData
  : TCollectionName extends 'utilisationReports'
  ? UtilisationReport
  : WithId<object>;
