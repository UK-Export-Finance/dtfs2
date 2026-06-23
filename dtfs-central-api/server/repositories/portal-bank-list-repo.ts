import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { WithId } from 'mongodb';
import type { PortalBankListEntry } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../drivers/db-client';

/**
 * Returns all banks in the `portal-bank-list` collection ordered by the
 * numeric `order` field so the portal renders the banks consistently.
 */
export const getAllPortalBankListEntries = async (): Promise<WithId<PortalBankListEntry>[]> => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.PORTAL_BANK_LIST);

  const docs = await collection
    .find({}, { projection: { name: 1, order: 1 } })
    .sort({ order: 1, name: 1 })
    .toArray();

  return docs;
};
