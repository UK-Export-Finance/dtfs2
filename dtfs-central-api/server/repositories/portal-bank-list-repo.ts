import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { WithId, Document } from 'mongodb';
import { mongoDbClient as db } from '../drivers/db-client';

/**
 * Returns every document in the `portal-bank-list` collection.
 *
 * Results are sorted by `order` ascending, then by `name` ascending as a stable
 * tie-breaker, so callers receive the list in the exact sequence it should be
 * rendered on the portal homepage. No pagination, projection, or filtering is
 * applied — the full collection is returned in one round-trip. The list is
 * expected to remain small (current size is 18 entries).
 */
export const getAllPortalBankListEntries = async (): Promise<WithId<Document>[]> => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST);
  return collection.find().sort({ order: 1, name: 1 }).toArray();
};
