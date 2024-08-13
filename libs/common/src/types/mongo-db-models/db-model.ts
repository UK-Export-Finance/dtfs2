import { WithId } from 'mongodb';
import { MongoDbCollectionName } from './mongo-db-collection-name';
import { Bank } from './banks';
import { PortalUser } from './users';
import { TfmUser } from './tfm-users';
import { TfmTeam } from './tfm-teams';
import { DeletionAuditLog } from './deletion-audit-logs';
import { TfmFacility } from './tfm-facilities';
import { Facility } from './facility';

/**
 * This type gets the type of the MongoDB model
 * associated with a specific collection. If the
 * type for a specific collection is not defined,
 * the `WithId<any>` type is returned.
 *
 *
 * Note: `WithId<any>` was chosen as the default
 * because certain collections (such as `'deals'`)
 * have complicated type signatures that will
 * likely never be defined. Using `object` or
 * `Record<string, unknown>` for these types can
 * therefore result in many type errors which
 * would be complicated to fix. `any` is chosen
 * so that this type can be used for all collections
 * and not just the ones that we have fully defined
 * types for.
 *
 * @example
 * type UsersDbModel = DbModel<'users'>; // MyDbModel = PortalUser
 */
export type DbModel<TCollectionName extends MongoDbCollectionName> = TCollectionName extends 'banks'
  ? Bank
  : TCollectionName extends 'users'
  ? PortalUser
  : TCollectionName extends 'tfm-users'
  ? TfmUser
  : TCollectionName extends 'tfm-teams'
  ? TfmTeam
  : TCollectionName extends 'deletion-audit-logs'
  ? DeletionAuditLog
  : TCollectionName extends 'tfm-facilities'
  ? TfmFacility
  : TCollectionName extends 'facilities'
  ? Facility
  : WithId<any>;
